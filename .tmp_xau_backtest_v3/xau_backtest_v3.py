from __future__ import annotations
import os, json, math, urllib.request
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import numpy as np
import pandas as pd

BASE = "https://raw.githubusercontent.com/kevingtlin/Market-Data-Lab/main/xauusd/{side}/m1/xauusd_{side}_m1_{ym}.csv"
DATA = Path("xau_bt_data_v3")
OUT = Path("xau_bt_results_v3")
DATA.mkdir(exist_ok=True)
OUT.mkdir(exist_ok=True)

TEST_START = pd.Timestamp("2010-01-11 00:00:00", tz="UTC")
TEST_END   = pd.Timestamp("2026-08-20 23:58:59", tz="UTC")
TF_MAP = {"M3":"3min","M5":"5min","M15":"15min"}
TF_DELTA = {"M3":pd.Timedelta(minutes=3),"M5":pd.Timedelta(minutes=5),"M15":pd.Timedelta(minutes=15)}
FIBS = [0.382, 0.50, 0.65, 0.75]
RRS = [2.0, 2.5, 3.0]
MAX_BOS_HOURS = 24
MAX_RETEST_HOURS = 24
MAX_HOLD_DAYS = 7
BODY_RATIO_MIN = 0.25

def month_list():
    out=[]
    y,m=2010,1
    while (y,m) <= (2026,8):
        out.append(f"{y:04d}_{m:02d}")
        m += 1
        if m==13:
            y += 1; m=1
    return out

def dl_one(side, ym):
    p = DATA / f"xauusd_{side}_m1_{ym}.csv"
    if p.exists() and p.stat().st_size > 100:
        return str(p)
    url = BASE.format(side=side, ym=ym)
    tmp = p.with_suffix(".tmp")
    try:
        urllib.request.urlretrieve(url, tmp)
        tmp.replace(p)
        return str(p)
    except Exception as e:
        if tmp.exists(): tmp.unlink()
        raise RuntimeError(f"download failed {side} {ym}: {e}")

def download_all(months):
    jobs=[(s,ym) for ym in months for s in ("bid","ask")]
    print("Downloading",len(jobs),"monthly BID/ASK files...")
    with ThreadPoolExecutor(max_workers=20) as ex:
        futs={ex.submit(dl_one,s,ym):(s,ym) for s,ym in jobs}
        done=0
        for f in as_completed(futs):
            f.result()
            done+=1
            if done%50==0: print(" downloaded",done,"/",len(jobs))

def read_month(ym):
    b=pd.read_csv(DATA/f"xauusd_bid_m1_{ym}.csv")
    a=pd.read_csv(DATA/f"xauusd_ask_m1_{ym}.csv")
    for d in (b,a):
        d["timestamp"]=pd.to_numeric(d["timestamp"],errors="coerce")
        for c in ("open","high","low","close"):
            d[c]=pd.to_numeric(d[c],errors="coerce")
        d.dropna(inplace=True)
    m=b.merge(a,on="timestamp",suffixes=("_bid","_ask"),how="inner")
    return m

def load_all(months):
    chunks=[]
    for k,ym in enumerate(months,1):
        chunks.append(read_month(ym))
        if k%24==0: print(" loaded months",k,"/",len(months))
    m=pd.concat(chunks,ignore_index=True)
    m.drop_duplicates("timestamp",inplace=True)
    m.sort_values("timestamp",inplace=True)
    m["dt"]=pd.to_datetime(m["timestamp"],unit="ms",utc=True)
    m.set_index("dt",inplace=True)
    keep=["open_bid","high_bid","low_bid","close_bid","open_ask","high_ask","low_ask","close_ask"]
    m=m[keep].astype("float64")
    m=m.loc[:TEST_END]
    return m

def resample_bid(m, freq, **kwargs):
    x=m[["open_bid","high_bid","low_bid","close_bid"]].resample(freq, **kwargs).agg(
        {"open_bid":"first","high_bid":"max","low_bid":"min","close_bid":"last"}
    ).dropna()
    x.columns=["open","high","low","close"]
    prev=x["close"].shift(1)
    tr=pd.concat([(x["high"]-x["low"]),(x["high"]-prev).abs(),(x["low"]-prev).abs()],axis=1).max(axis=1)
    x["atr14"]=tr.rolling(14,min_periods=14).mean()
    return x

def pivot_flags(x):
    h=x["high"]; l=x["low"]
    ph=(h>h.shift(1))&(h>=h.shift(2))&(h>h.shift(-1))&(h>=h.shift(-2))
    pl=(l<l.shift(1))&(l<=l.shift(2))&(l<l.shift(-1))&(l<=l.shift(-2))
    return ph.fillna(False),pl.fillna(False)

def last_confirmed_pivots(x):
    ph,pl=pivot_flags(x)
    sh=x["high"].where(ph).shift(3).ffill()
    sl=x["low"].where(pl).shift(3).ffill()
    return sh,sl

def pivot_records(x, prefix):
    ph,pl=pivot_flags(x)
    rec=[]
    idx=x.index
    for i in np.flatnonzero(ph.to_numpy()):
        if i+3 < len(x):
            rec.append((idx[i+3],"SHORT",f"{prefix}SH",float(x["high"].iloc[i]),str(idx[i])))
    for i in np.flatnonzero(pl.to_numpy()):
        if i+3 < len(x):
            rec.append((idx[i+3],"LONG",f"{prefix}SL",float(x["low"].iloc[i]),str(idx[i])))
    return rec

def first_cross_in_m1(midx, highs, lows, start, end, direction, level):
    i0=midx.searchsorted(start,side="left")
    i1=midx.searchsorted(end,side="left")
    if i1<=i0: return None
    arr = highs[i0:i1] if direction=="SHORT" else lows[i0:i1]
    cond = arr > level if direction=="SHORT" else arr < level
    hits=np.flatnonzero(cond)
    if hits.size==0: return None
    return midx[i0+int(hits[0])]

def build_liquidity_events(m):
    midx=m.index
    hi=m["high_bid"].to_numpy()
    lo=m["low_bid"].to_numpy()
    events=[]
    daily=resample_bid(m,"1D")
    daily=daily[daily.index<=TEST_END]
    for i in range(1,len(daily)):
        start=daily.index[i]; end=start+pd.Timedelta(days=1)
        if end<TEST_START or start>TEST_END: continue
        p=daily.iloc[i-1]
        t=first_cross_in_m1(midx,hi,lo,start,end,"SHORT",float(p["high"]))
        if t is not None: events.append((t,"SHORT","PDH",float(p["high"]),str(daily.index[i-1])))
        t=first_cross_in_m1(midx,hi,lo,start,end,"LONG",float(p["low"]))
        if t is not None: events.append((t,"LONG","PDL",float(p["low"]),str(daily.index[i-1])))

    weekly=resample_bid(m,"W-MON",label="left",closed="left")
    weekly=weekly[weekly.index<=TEST_END]
    for i in range(1,len(weekly)):
        start=weekly.index[i]; end=start+pd.Timedelta(days=7)
        if end<TEST_START or start>TEST_END: continue
        p=weekly.iloc[i-1]
        t=first_cross_in_m1(midx,hi,lo,start,end,"SHORT",float(p["high"]))
        if t is not None: events.append((t,"SHORT","PWH",float(p["high"]),str(weekly.index[i-1])))
        t=first_cross_in_m1(midx,hi,lo,start,end,"LONG",float(p["low"]))
        if t is not None: events.append((t,"LONG","PWL",float(p["low"]),str(weekly.index[i-1])))

    h1=resample_bid(m,"1h")
    hidx=h1.index
    hhi=h1["high"].to_numpy(); hlo=h1["low"].to_numpy()
    swing_recs=pivot_records(daily,"D1")+pivot_records(weekly,"W1")
    for n,(avail,direction,ltype,level,src) in enumerate(swing_recs,1):
        if avail>TEST_END: continue
        hs=hidx.searchsorted(avail,side="left")
        arr=hhi[hs:] if direction=="SHORT" else hlo[hs:]
        cond=arr>level if direction=="SHORT" else arr<level
        hits=np.flatnonzero(cond)
        if hits.size==0: continue
        hpos=hs+int(hits[0]); hs_time=hidx[hpos]
        t=first_cross_in_m1(midx,hi,lo,hs_time,hs_time+pd.Timedelta(hours=1),direction,level)
        if t is None: t=hs_time
        if t>=TEST_START and t<=TEST_END:
            events.append((t,direction,ltype,level,src))
        if n%500==0: print(" swing levels processed",n,"/",len(swing_recs))

    e=pd.DataFrame(events,columns=["sweep_time","direction","level_type","level_price","source_bar"])
    e=e[(e.sweep_time>=TEST_START)&(e.sweep_time<=TEST_END)].copy()
    e.sort_values(["sweep_time","direction","level_type"],inplace=True)
    e.drop_duplicates(["sweep_time","direction","level_type","level_price"],inplace=True)
    e.reset_index(drop=True,inplace=True)
    return e,daily,weekly

def make_setups(m, events):
    setups=[]
    midx=m.index
    mhi=m["high_bid"].to_numpy(); mlo=m["low_bid"].to_numpy()
    for tf,freq in TF_MAP.items():
        print("Scanning",tf,"events",len(events))
        x=resample_bid(m,freq)
        sh,sl=last_confirmed_pivots(x)
        idx=x.index
        op=x["open"].to_numpy(); hi=x["high"].to_numpy(); lo=x["low"].to_numpy(); cl=x["close"].to_numpy()
        atr=x["atr14"].to_numpy()
        shv=sh.to_numpy(); slv=sl.to_numpy()
        delta=TF_DELTA[tf]
        for k,e in events.iterrows():
            st=e.sweep_time
            bstart=st.floor(freq)
            j0=idx.searchsorted(bstart,side="left")
            if j0>=len(x): continue
            j1=idx.searchsorted(st+pd.Timedelta(hours=MAX_BOS_HOURS),side="right")
            found=None
            for j in range(max(j0,1),min(j1,len(x))):
                if idx[j]+delta <= st: continue
                rng=hi[j]-lo[j]
                if rng<=0: continue
                br=abs(cl[j]-op[j])/rng
                if br < BODY_RATIO_MIN: continue
                if e.direction=="LONG":
                    lvl=shv[j]
                    if not np.isfinite(lvl): continue
                    if cl[j]>op[j] and cl[j]>lvl and cl[j-1]<=lvl:
                        found=(j,float(lvl)); break
                else:
                    lvl=slv[j]
                    if not np.isfinite(lvl): continue
                    if cl[j]<op[j] and cl[j]<lvl and cl[j-1]>=lvl:
                        found=(j,float(lvl)); break
            if found is None: continue
            j,bos_level=found
            bos_time=idx[j]+delta
            a=midx.searchsorted(st,side="left"); b=midx.searchsorted(bos_time,side="left")
            if b<=a: continue
            impulse_low=float(np.nanmin(mlo[a:b]))
            impulse_high=float(np.nanmax(mhi[a:b]))
            if not np.isfinite(impulse_low+impulse_high) or impulse_high<=impulse_low: continue
            setups.append({
                "tf":tf,"sweep_time":st,"direction":e.direction,"level_type":e.level_type,
                "level_price":e.level_price,"source_bar":e.source_bar,
                "bos_time":bos_time,"bos_level":bos_level,"impulse_low":impulse_low,"impulse_high":impulse_high,
                "atr14":float(atr[j]) if np.isfinite(atr[j]) else np.nan
            })
        print(tf,"raw setups",sum(1 for z in setups if z["tf"]==tf))
    s=pd.DataFrame(setups)
    if s.empty: return s
    agg=[]
    for keys,g in s.groupby(["tf","direction","bos_time"],sort=True):
        g=g.sort_values("sweep_time")
        base=g.iloc[-1].to_dict()
        base["level_types"]="+".join(sorted(set(g["level_type"].astype(str))))
        base["n_levels_swept"]=int(len(g))
        st=base["sweep_time"]; bt=base["bos_time"]
        a=midx.searchsorted(st,side="left"); b=midx.searchsorted(bt,side="left")
        base["impulse_low"]=float(np.nanmin(mlo[a:b])); base["impulse_high"]=float(np.nanmax(mhi[a:b]))
        agg.append(base)
    s=pd.DataFrame(agg).sort_values(["tf","bos_time"]).reset_index(drop=True)
    return s

def max_drawdown(rs):
    eq=np.cumsum(np.asarray(rs,float))
    if len(eq)==0: return np.nan
    curve=np.r_[0.0,eq]
    peak=np.maximum.accumulate(curve)
    dd=curve-peak
    return float(dd.min())

def simulate_trades(m,setups,median_spread):
    if setups.empty: return pd.DataFrame()
    idx=m.index
    hb=m["high_bid"].to_numpy(); lb=m["low_bid"].to_numpy(); cb=m["close_bid"].to_numpy()
    ha=m["high_ask"].to_numpy(); la=m["low_ask"].to_numpy(); ca=m["close_ask"].to_numpy()
    rows=[]
    for si,s in setups.iterrows():
        impulse_low=float(s.impulse_low); impulse_high=float(s.impulse_high); span=impulse_high-impulse_low
        if span<=0: continue
        atr=float(s.atr14) if np.isfinite(s.atr14) else span*0.1
        buffer=max(2.0*median_spread,0.05*atr)
        if s.direction=="LONG":
            stop=impulse_low-buffer
        else:
            stop=impulse_high+buffer
        start=idx.searchsorted(s.bos_time,side="left")
        end=idx.searchsorted(s.bos_time+pd.Timedelta(hours=MAX_RETEST_HOURS),side="right")
        if end<=start: continue
        for fib in FIBS:
            entry = impulse_high - fib*span if s.direction=="LONG" else impulse_low + fib*span
            if s.direction=="LONG":
                fill_hits=np.flatnonzero(la[start:end] <= entry)
                inv_hits=np.flatnonzero(lb[start:end] <= stop)
            else:
                fill_hits=np.flatnonzero(hb[start:end] >= entry)
                inv_hits=np.flatnonzero(ha[start:end] >= stop)
            if fill_hits.size==0: continue
            fpos=start+int(fill_hits[0])
            if inv_hits.size and int(inv_hits[0]) < int(fill_hits[0]):
                continue
            risk=(entry-stop) if s.direction=="LONG" else (stop-entry)
            if risk<=0: continue
            hold_end=idx.searchsorted(idx[fpos]+pd.Timedelta(days=MAX_HOLD_DAYS),side="right")
            hold_end=min(hold_end,len(idx))
            for rr in RRS:
                tp=entry+rr*risk if s.direction=="LONG" else entry-rr*risk
                if s.direction=="LONG":
                    stop_hits=np.flatnonzero(lb[fpos:hold_end] <= stop)
                    tp_hits=np.flatnonzero(hb[fpos:hold_end] >= tp)
                else:
                    stop_hits=np.flatnonzero(ha[fpos:hold_end] >= stop)
                    tp_hits=np.flatnonzero(la[fpos:hold_end] <= tp)
                si0=int(stop_hits[0]) if stop_hits.size else None
                ti0=int(tp_hits[0]) if tp_hits.size else None
                outcome="TIMEOUT"; rres=None; exit_pos=hold_end-1
                if si0 is not None and (ti0 is None or si0<=ti0):
                    outcome="SL"; rres=-1.0; exit_pos=fpos+si0
                elif ti0 is not None:
                    outcome="TP"; rres=float(rr); exit_pos=fpos+ti0
                else:
                    exit_price=float(cb[exit_pos]) if s.direction=="LONG" else float(ca[exit_pos])
                    rres=(exit_price-entry)/risk if s.direction=="LONG" else (entry-exit_price)/risk
                rows.append({
                    "tf":s.tf,"fib":fib,"rr_target":rr,"direction":s.direction,
                    "sweep_time":s.sweep_time,"bos_time":s.bos_time,"entry_time":idx[fpos],"exit_time":idx[exit_pos],
                    "level_types":s.level_types,"n_levels_swept":s.n_levels_swept,
                    "level_price":s.level_price,"bos_level":s.bos_level,
                    "impulse_low":impulse_low,"impulse_high":impulse_high,"entry":entry,"stop":stop,"tp":tp,
                    "risk_price":risk,"outcome":outcome,"R":float(rres)
                })
    return pd.DataFrame(rows)

def summarize(g):
    rs=g["R"].astype(float)
    pos=rs[rs>0].sum(); neg=-rs[rs<0].sum()
    pf=float(pos/neg) if neg>0 else (math.inf if pos>0 else 0.0)
    return pd.Series({
        "trades":len(g),
        "longs":int((g.direction=="LONG").sum()),"shorts":int((g.direction=="SHORT").sum()),
        "win_rate_pct":100.0*float((rs>0).mean()),"tp_hit_pct":100.0*float((g.outcome=="TP").mean()),
        "profit_factor":pf,"expectancy_R":float(rs.mean()),"total_R":float(rs.sum()),"max_dd_R":max_drawdown(rs),
        "timeouts":int((g.outcome=="TIMEOUT").sum()),
        "ops_per_week":float(len(g)/((TEST_END-TEST_START).total_seconds()/604800.0)),
        "avg_hold_hours":float((g.exit_time-g.entry_time).dt.total_seconds().mean()/3600.0)
    })

def main():
    months=month_list()
    download_all(months)
    print("Loading all data...")
    m=load_all(months)
    median_spread=float((m.close_ask-m.close_bid).median())
    print("M1 rows",len(m),"from",m.index.min(),"to",m.index.max(),"median spread",median_spread)
    events,daily,weekly=build_liquidity_events(m)
    print("Liquidity events",len(events))
    print(events.level_type.value_counts().to_string())
    setups=make_setups(m,events)
    print("DEDUP SETUPS")
    print(setups.groupby(["tf","direction"]).size().to_string())
    trades=simulate_trades(m,setups,median_spread)
    if trades.empty:
        raise RuntimeError("No trades generated")

    summary=trades.groupby(["tf","fib","rr_target"],group_keys=False).apply(summarize,include_groups=False).reset_index()
    direction=trades.groupby(["tf","fib","rr_target","direction"],group_keys=False).apply(summarize,include_groups=False).reset_index()
    annual=trades.assign(year=trades.entry_time.dt.year).groupby(["tf","fib","rr_target","year"],group_keys=False).apply(summarize,include_groups=False).reset_index()
    level_exp=trades.assign(level_type=trades.level_types.str.split("+")).explode("level_type")
    levels=level_exp.groupby(["tf","fib","rr_target","level_type"],group_keys=False).apply(summarize,include_groups=False).reset_index()

    tmp=setups.copy()
    tmp["bos_delay_min"]=(tmp.bos_time-tmp.sweep_time).dt.total_seconds()/60
    setup_summary=tmp.groupby(["tf","direction"]).agg(
        setups=("tf","size"),first_sweep=("sweep_time","min"),last_sweep=("sweep_time","max"),
        median_bos_delay_min=("bos_delay_min","median")
    ).reset_index()

    OUT.mkdir(exist_ok=True)
    events.to_csv(OUT/"liquidity_events.csv",index=False)
    setups.to_csv(OUT/"setups.csv",index=False)
    trades.to_csv(OUT/"trades.csv",index=False)
    summary.to_csv(OUT/"summary.csv",index=False)
    direction.to_csv(OUT/"direction.csv",index=False)
    annual.to_csv(OUT/"annual.csv",index=False)
    levels.to_csv(OUT/"levels.csv",index=False)
    setup_summary.to_csv(OUT/"setup_summary.csv",index=False)
    meta={
        "source":"Dukascopy via kevingtlin/Market-Data-Lab public GitHub dataset",
        "test_start":str(TEST_START),"test_end":str(TEST_END),"m1_rows":len(m),
        "m1_first":str(m.index.min()),"m1_last":str(m.index.max()),"median_spread":median_spread,
        "rules":{
            "trend_filter":"NONE",
            "liquidity":"PDH/PDL for current UTC day, PWH/PWL for current UTC week, plus every confirmed 2L/2R D1 and W1 swing level active until first sweep",
            "sweep":"first M1 trade strictly through the liquidity level; no same-candle reclaim required",
            "trigger_timeframes":"M3, M5, M15 reconstructed from M1",
            "ltf_swing":"2-left/2-right pivot; usable only from the next bar after both right-hand bars are closed",
            "bos":"first opposite structural crossing within 24h: bullish/bearish candle body, close beyond latest confirmed opposite swing, previous close on the other side; candle body >=25% of range",
            "fib_retest":"four independent entry variants at 38.2%, 50%, 65%, 75% retracement of complete sweep-to-BOS impulse; fill allowed within 24h after BOS",
            "stop":"beyond complete sweep-to-BOS extreme; buffer=max(2x global median spread, 5% ATR14 trigger TF)",
            "targets":"2R, 2.5R, 3R independently",
            "execution":"long fill on ask / exits on bid; short fill on bid / exits on ask",
            "same_minute":"SL wins if SL and TP both touched in same M1 candle",
            "hold":"7 calendar days max, then mark-to-market",
            "dedup":"multiple liquidity levels leading to the exact same TF/direction/BOS close are one setup, all swept level labels retained",
            "session_filter":"none","daily_weekly_boundaries":"UTC"
        }
    }
    (OUT/"metadata.json").write_text(json.dumps(meta,indent=2,default=str),encoding="utf-8")

    print("\n=== SETUP COUNTS ===")
    print(setup_summary.to_string(index=False))
    print("\n=== SUMMARY ===")
    print(summary.to_string(index=False))
    print("\n=== DIRECTION ===")
    print(direction.to_string(index=False))
    print("\n=== LEVELS ===")
    print(levels.to_string(index=False))
    print("SUMMARY_JSON="+summary.to_json(orient="records"))
    print("DIRECTION_JSON="+direction.to_json(orient="records"))
    print("SETUP_JSON="+setup_summary.to_json(orient="records"))
    print("META_JSON="+json.dumps(meta,default=str))

if __name__=="__main__":
    main()
