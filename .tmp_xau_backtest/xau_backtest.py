#!/usr/bin/env python3
import os, json, math, urllib.request, concurrent.futures
from pathlib import Path
import numpy as np
import pandas as pd

BASE = "https://raw.githubusercontent.com/kevingtlin/Market-Data-Lab/main/xauusd"
WARMUP_START = "2019-11-01"
TEST_START = pd.Timestamp("2020-01-01 00:00:00")
TEST_END = pd.Timestamp("2025-12-31 23:59:59")
YEARS_MONTHS = [(y,m) for y in range(2019,2026) for m in range(1,13)
                if pd.Timestamp(y,m,1) >= pd.Timestamp(WARMUP_START) and pd.Timestamp(y,m,1) <= TEST_END]
DATA = Path("xau_bt_data")
OUT = Path("xau_bt_results")
DATA.mkdir(exist_ok=True); OUT.mkdir(exist_ok=True)

def url(side,y,m):
    return f"{BASE}/{side}/m1/xauusd_{side}_m1_{y}_{m:02d}.csv"

def dest(side,y,m):
    return DATA / f"xauusd_{side}_m1_{y}_{m:02d}.csv"

def dl(item):
    side,y,m=item
    p=dest(side,y,m)
    if p.exists() and p.stat().st_size>1000:
        return str(p)
    u=url(side,y,m)
    for attempt in range(4):
        try:
            urllib.request.urlretrieve(u,p)
            if p.stat().st_size>1000: return str(p)
        except Exception:
            if attempt==3: raise
    return str(p)

print(f"Downloading {len(YEARS_MONTHS)*2} monthly files...")
items=[(s,y,m) for y,m in YEARS_MONTHS for s in ("bid","ask")]
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
    list(ex.map(dl,items))

def load_side(side):
    frames=[]
    for y,m in YEARS_MONTHS:
        f=dest(side,y,m)
        d=pd.read_csv(f, usecols=["timestamp","open","high","low","close"])
        d["timestamp"]=pd.to_datetime(d["timestamp"],unit="ms",utc=True).dt.tz_convert(None)
        d=d.rename(columns={c:f"{c}_{side}" for c in ["open","high","low","close"]})
        frames.append(d)
    x=pd.concat(frames,ignore_index=True)
    x=x.drop_duplicates("timestamp").sort_values("timestamp")
    return x

print("Loading BID/ASK...")
bid=load_side("bid"); ask=load_side("ask")
m1=bid.merge(ask,on="timestamp",how="inner",validate="one_to_one").sort_values("timestamp").reset_index(drop=True)
m1=m1[(m1.timestamp>=pd.Timestamp(WARMUP_START))&(m1.timestamp<=TEST_END)].copy()
m1["spread_close"]=m1["close_ask"]-m1["close_bid"]
print("M1 rows",len(m1),"from",m1.timestamp.min(),"to",m1.timestamp.max(),
      "median spread",float(m1.spread_close.median()))

idx=m1.set_index("timestamp")
def rs(rule, side="bid"):
    return idx.resample(rule,label="left",closed="left").agg({
        f"open_{side}":"first",f"high_{side}":"max",f"low_{side}":"min",f"close_{side}":"last"
    }).rename(columns={f"open_{side}":"open",f"high_{side}":"high",f"low_{side}":"low",f"close_{side}":"close"}).dropna()

bid_m5=rs("5min"); bid_m15=rs("15min"); h4=rs("4h"); d1=rs("1D"); w1=rs("W-MON")
spread5=idx["spread_close"].resample("5min",label="left",closed="left").median()
spread15=idx["spread_close"].resample("15min",label="left",closed="left").median()

h4["ema50"]=h4["close"].ewm(span=50,adjust=False).mean()
h4["sma200"]=h4["close"].rolling(200,min_periods=200).mean()
h4avail=h4[["close","ema50","sma200"]].shift(1)
h4avail["trend"]=np.select([
    (h4avail["close"]>h4avail["sma200"])&(h4avail["ema50"]>h4avail["sma200"]),
    (h4avail["close"]<h4avail["sma200"])&(h4avail["ema50"]<h4avail["sma200"])
],[1,-1],default=0)

def pivot_series(df,kind,n=2):
    if kind=="high":
        s=df["high"]
        p=(s>s.shift(1))&(s>s.shift(2))&(s>=s.shift(-1))&(s>=s.shift(-2))
    else:
        s=df["low"]
        p=(s<s.shift(1))&(s<s.shift(2))&(s<=s.shift(-1))&(s<=s.shift(-2))
    return s.where(p)

d1["PDH"]=d1["high"].shift(1); d1["PDL"]=d1["low"].shift(1)
d1["D1SH"]=pivot_series(d1,"high").shift(2).ffill()
d1["D1SL"]=pivot_series(d1,"low").shift(2).ffill()
w1["PWH"]=w1["high"].shift(1); w1["PWL"]=w1["low"].shift(1)
w1["W1SH"]=pivot_series(w1,"high").shift(2).ffill()
w1["W1SL"]=pivot_series(w1,"low").shift(2).ffill()

def asof_series(source, col, target_index):
    s=source[col].reindex(source.index.union(target_index)).sort_index().ffill()
    return s.reindex(target_index).to_numpy()

mt=m1["timestamp"].to_numpy(dtype="datetime64[ns]")
bid_low=m1["low_bid"].to_numpy(float); bid_high=m1["high_bid"].to_numpy(float); bid_close=m1["close_bid"].to_numpy(float)
ask_low=m1["low_ask"].to_numpy(float); ask_high=m1["high_ask"].to_numpy(float); ask_close=m1["close_ask"].to_numpy(float)

def first_outcome(direction, entry_t, entry, sl, rr, max_days=7):
    tp=entry+rr*(entry-sl) if direction=="LONG" else entry-rr*(sl-entry)
    i=np.searchsorted(mt,np.datetime64(entry_t),side="left")
    j=np.searchsorted(mt,np.datetime64(entry_t+pd.Timedelta(days=max_days)),side="right")
    if i>=len(mt): return None
    j=min(j,len(mt))
    if direction=="LONG":
        stop_hits=np.flatnonzero(bid_low[i:j]<=sl)
        tp_hits=np.flatnonzero(bid_high[i:j]>=tp)
    else:
        stop_hits=np.flatnonzero(ask_high[i:j]>=sl)
        tp_hits=np.flatnonzero(ask_low[i:j]<=tp)
    si=(stop_hits[0] if len(stop_hits) else 10**18)
    ti=(tp_hits[0] if len(tp_hits) else 10**18)
    if si==10**18 and ti==10**18:
        k=j-1
        if k<i: return None
        px=bid_close[k] if direction=="LONG" else ask_close[k]
        r=(px-entry)/(entry-sl) if direction=="LONG" else (entry-px)/(sl-entry)
        return ("TIME",float(r),pd.Timestamp(mt[k]),float(tp))
    if si<=ti:
        k=i+si; return ("SL",-1.0,pd.Timestamp(mt[k]),float(tp))
    k=i+ti; return ("TP",float(rr),pd.Timestamp(mt[k]),float(tp))

def build_model(tf_name, bars, spread):
    mins=5 if tf_name=="M5" else 15
    df=bars.copy()
    pc=df["close"].shift(1)
    tr=pd.concat([(df.high-df.low),(df.high-pc).abs(),(df.low-pc).abs()],axis=1).max(axis=1)
    df["atr14"]=tr.rolling(14,min_periods=14).mean()
    df["spread"]=spread.reindex(df.index)
    df["last_sw_high"]=pivot_series(df,"high").shift(2).ffill()
    df["last_sw_low"]=pivot_series(df,"low").shift(2).ffill()

    ix=df.index
    df["trend"]=asof_series(h4avail,"trend",ix)
    for c in ["PDH","PDL","D1SH","D1SL"]:
        df[c]=asof_series(d1,c,ix)
    for c in ["PWH","PWL","W1SH","W1SL"]:
        df[c]=asof_series(w1,c,ix)

    times=ix.to_numpy(dtype="datetime64[ns]")
    H=df.high.to_numpy(float); L=df.low.to_numpy(float); C=df.close.to_numpy(float)
    atr=df.atr14.to_numpy(float); spr=df.spread.fillna(m1.spread_close.median()).to_numpy(float)
    trend=df.trend.to_numpy(int)
    swH=df.last_sw_high.to_numpy(float); swL=df.last_sw_low.to_numpy(float)
    level_arrays={k:df[k].to_numpy(float) for k in ["PDH","PDL","PWH","PWL","D1SH","D1SL","W1SH","W1SL"]}

    consumed={k:None for k in level_arrays}
    setups=[]
    bos_window=int(240/mins)
    retest_minutes=8*60
    start_i=np.searchsorted(times,np.datetime64(TEST_START))
    for i in range(start_i,len(df)-bos_window-2):
        long_names=[]; short_names=[]
        for name in ["PDL","PWL","D1SL","W1SL"]:
            lv=level_arrays[name][i]
            if np.isfinite(lv) and L[i] < lv and C[i] > lv:
                if consumed[name] is None or not math.isclose(consumed[name],lv,rel_tol=0,abs_tol=1e-8):
                    long_names.append(name); consumed[name]=lv
        for name in ["PDH","PWH","D1SH","W1SH"]:
            lv=level_arrays[name][i]
            if np.isfinite(lv) and H[i] > lv and C[i] < lv:
                if consumed[name] is None or not math.isclose(consumed[name],lv,rel_tol=0,abs_tol=1e-8):
                    short_names.append(name); consumed[name]=lv

        if long_names and trend[i]==1 and np.isfinite(swH[i]) and C[i] <= swH[i] and np.isfinite(atr[i]):
            ref=float(swH[i]); bos=None
            for j in range(i+1,min(i+1+bos_window,len(df))):
                if trend[j]==1 and C[j]>ref and C[j-1]<=ref:
                    bos=j; break
            if bos is not None:
                imp_lo=float(np.min(L[i:bos+1])); imp_hi=float(np.max(H[i:bos+1])); rng=imp_hi-imp_lo
                depth=(imp_hi-ref)/rng if rng>0 else np.nan
                if np.isfinite(depth) and 0.382<=depth<=0.75:
                    buffer=max(2*max(spr[i],0),0.05*atr[i]); sl=imp_lo-buffer; entry=ref
                    if sl<entry:
                        start_t=pd.Timestamp(times[bos])+pd.Timedelta(minutes=mins); end_t=start_t+pd.Timedelta(minutes=retest_minutes)
                        a=np.searchsorted(mt,np.datetime64(start_t),"left"); b=np.searchsorted(mt,np.datetime64(end_t),"right")
                        fill=None
                        for k in range(a,min(b,len(mt))):
                            if bid_low[k]<=sl: break
                            if ask_low[k]<=entry: fill=k; break
                        if fill is not None:
                            setups.append(dict(tf=tf_name,direction="LONG",sweep_time=pd.Timestamp(times[i]),bos_time=pd.Timestamp(times[bos]),entry_time=pd.Timestamp(mt[fill]),entry=entry,sl=sl,fib_depth=depth,levels="+".join(long_names),n_levels=len(long_names)))

        if short_names and trend[i]==-1 and np.isfinite(swL[i]) and C[i] >= swL[i] and np.isfinite(atr[i]):
            ref=float(swL[i]); bos=None
            for j in range(i+1,min(i+1+bos_window,len(df))):
                if trend[j]==-1 and C[j]<ref and C[j-1]>=ref:
                    bos=j; break
            if bos is not None:
                imp_lo=float(np.min(L[i:bos+1])); imp_hi=float(np.max(H[i:bos+1])); rng=imp_hi-imp_lo
                depth=(ref-imp_lo)/rng if rng>0 else np.nan
                if np.isfinite(depth) and 0.382<=depth<=0.75:
                    buffer=max(2*max(spr[i],0),0.05*atr[i]); sl=imp_hi+buffer; entry=ref
                    if sl>entry:
                        start_t=pd.Timestamp(times[bos])+pd.Timedelta(minutes=mins); end_t=start_t+pd.Timedelta(minutes=retest_minutes)
                        a=np.searchsorted(mt,np.datetime64(start_t),"left"); b=np.searchsorted(mt,np.datetime64(end_t),"right")
                        fill=None
                        for k in range(a,min(b,len(mt))):
                            if ask_high[k]>=sl: break
                            if bid_high[k]>=entry: fill=k; break
                        if fill is not None:
                            setups.append(dict(tf=tf_name,direction="SHORT",sweep_time=pd.Timestamp(times[i]),bos_time=pd.Timestamp(times[bos]),entry_time=pd.Timestamp(mt[fill]),entry=entry,sl=sl,fib_depth=depth,levels="+".join(short_names),n_levels=len(short_names)))
    return pd.DataFrame(setups)

print("Scanning M5...")
s5=build_model("M5",bid_m5,spread5)
print("Scanning M15...")
s15=build_model("M15",bid_m15,spread15)
setups=pd.concat([s5,s15],ignore_index=True)
print("Valid entries:",len(setups),"M5",len(s5),"M15",len(s15))

trades=[]
for rec in setups.to_dict("records"):
    for rr in (2.0,3.0):
        o=first_outcome(rec["direction"],rec["entry_time"],rec["entry"],rec["sl"],rr)
        if o is None: continue
        status,r,exit_t,tp=o
        x=rec.copy(); x.update(rr_target=rr,status=status,r=r,exit_time=exit_t,tp=tp)
        trades.append(x)
tr=pd.DataFrame(trades)
if tr.empty:
    raise RuntimeError("No trades generated; inspect rules/data.")

tr["year"]=pd.to_datetime(tr.entry_time).dt.year
tr["week"]=pd.to_datetime(tr.entry_time).dt.to_period("W").astype(str)
tr["win"]=tr.r>0
tr["tp_hit"]=tr.status=="TP"

def stats(g):
    pos=g.loc[g.r>0,"r"].sum(); neg=-g.loc[g.r<0,"r"].sum(); pf=pos/neg if neg>0 else np.inf
    eq=g.sort_values("entry_time").r.cumsum(); dd=(eq-eq.cummax()).min() if len(eq) else np.nan
    weeks=(pd.Timestamp(g.entry_time.max())-pd.Timestamp(g.entry_time.min())).days/7 if len(g)>1 else np.nan
    return pd.Series({"trades":len(g),"longs":int((g.direction=="LONG").sum()),"shorts":int((g.direction=="SHORT").sum()),"win_rate_pct":100*g.win.mean(),"tp_hit_pct":100*g.tp_hit.mean(),"profit_factor":pf,"expectancy_R":g.r.mean(),"total_R":g.r.sum(),"max_dd_R":dd,"timeouts":int((g.status=="TIME").sum()),"ops_per_week":len(g)/weeks if weeks and weeks>0 else np.nan,"avg_fib_depth":g.fib_depth.mean()})

def grouped_stats(df, keys):
    rows=[]
    for key,g in df.groupby(keys,sort=True):
        if not isinstance(key,tuple): key=(key,)
        row=dict(zip(keys,key)); row.update(stats(g).to_dict()); rows.append(row)
    return pd.DataFrame(rows)

summary=grouped_stats(tr,["tf","rr_target"])
direction=grouped_stats(tr,["tf","rr_target","direction"])
annual=grouped_stats(tr,["tf","rr_target","year"])
tag=tr.assign(level=tr.levels.str.split("+")).explode("level")
level_stats=grouped_stats(tag,["tf","rr_target","level"])

tr.to_csv(OUT/"trades.csv",index=False); setups.to_csv(OUT/"setups.csv",index=False); summary.to_csv(OUT/"summary.csv",index=False); direction.to_csv(OUT/"direction.csv",index=False); annual.to_csv(OUT/"annual.csv",index=False); level_stats.to_csv(OUT/"levels.csv",index=False)
meta={"source":"Dukascopy via kevingtlin/Market-Data-Lab public GitHub dataset","data_utc":True,"warmup_start":WARMUP_START,"test_start":str(TEST_START),"test_end":str(TEST_END),"m1_rows":int(len(m1)),"m1_first":str(m1.timestamp.min()),"m1_last":str(m1.timestamp.max()),"median_spread":float(m1.spread_close.median()),"rules":{"trend":"H4 closed bar: LONG if close>SMA200 and EMA50>SMA200; SHORT if close<SMA200 and EMA50<SMA200","liquidity":"first sweep+reclaim of active PDL/PWL/latest confirmed D1/W1 swing low; mirror for highs","sweep":"wick strictly through level + same trigger candle close back inside","ltf_swings":"2-left/2-right pivots, available only 2 bars after pivot","bos":"body close crossing last confirmed opposite LTF swing after sweep, within 4h","retest":"first retest of broken BOS swing level within 8h; broken level must lie at 38.2%-75% retracement of sweep-to-BOS impulse","stop":"beyond complete sweep extreme, buffer=max(2x local median spread, 5% ATR14 trigger TF)","targets":"2R and 3R tested independently","execution":"M1 bid/ask: long fill on ask, long exits on bid; short fill on bid, short exits on ask","same_minute":"if TP and SL both touched in same M1 candle, count SL first","timeout":"7 calendar days, mark-to-market and include realized R","one_event":"first neutralization of each currently active liquidity level; simultaneous levels deduplicated into one setup","session_filter":"none","daily_weekly_boundaries":"UTC"}}
with open(OUT/"meta.json","w") as f: json.dump(meta,f,indent=2)
print("\n=== SUMMARY ==="); print(summary.to_string(index=False))
print("\n=== DIRECTION ==="); print(direction.to_string(index=False))
print("\n=== ANNUAL ==="); print(annual.to_string(index=False))
print("\n=== LEVELS ==="); print(level_stats.to_string(index=False))
print("SUMMARY_JSON="+summary.to_json(orient="records"))
print("DIRECTION_JSON="+direction.to_json(orient="records"))
print("META_JSON="+json.dumps(meta,separators=(",",":")))
