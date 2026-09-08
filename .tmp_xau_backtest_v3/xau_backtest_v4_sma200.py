from __future__ import annotations
import importlib.util, json, math
from pathlib import Path
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("bt", ROOT / "xau_backtest_v3.py")
bt = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bt)

OUT = Path("xau_bt_results_v4_sma200")
OUT.mkdir(exist_ok=True)

FILTERS = {
    "H2_SMA200": ("2h", pd.Timedelta(hours=2)),
    "H4_SMA200": ("4h", pd.Timedelta(hours=4)),
}


def attach_trend_state(m, setups, freq, delta, label):
    h = bt.resample_bid(m, freq).copy()
    h["sma200"] = h["close"].rolling(200, min_periods=200).mean()
    h = h.dropna(subset=["sma200"])
    state = pd.DataFrame({
        "available_time": h.index + delta,
        f"{label}_close": h["close"].to_numpy(),
        f"{label}_sma200": h["sma200"].to_numpy(),
    }).sort_values("available_time")
    s = setups.sort_values("bos_time").copy()
    s = pd.merge_asof(
        s,
        state,
        left_on="bos_time",
        right_on="available_time",
        direction="backward",
        allow_exact_matches=True,
    )
    close_col=f"{label}_close"; sma_col=f"{label}_sma200"
    ok=((s["direction"]=="LONG") & (s[close_col] > s[sma_col])) | ((s["direction"]=="SHORT") & (s[close_col] < s[sma_col]))
    return s.loc[ok].drop(columns=["available_time"]).copy()


def summarize_group(g):
    rs=g["R"].astype(float)
    pos=float(rs[rs>0].sum()); neg=float(-rs[rs<0].sum())
    pf=pos/neg if neg>0 else (math.inf if pos>0 else 0.0)
    return {
        "trades":int(len(g)),
        "longs":int((g["direction"]=="LONG").sum()),
        "shorts":int((g["direction"]=="SHORT").sum()),
        "win_rate_pct":100.0*float((rs>0).mean()),
        "tp_hit_pct":100.0*float((g["outcome"]=="TP").mean()),
        "profit_factor":float(pf),
        "expectancy_R":float(rs.mean()),
        "total_R":float(rs.sum()),
        "max_dd_R":float(bt.max_drawdown(rs)),
        "timeouts":int((g["outcome"]=="TIMEOUT").sum()),
        "ops_per_week":float(len(g)/((bt.TEST_END-bt.TEST_START).total_seconds()/604800.0)),
        "avg_hold_hours":float((g["exit_time"]-g["entry_time"]).dt.total_seconds().mean()/3600.0),
    }


def make_summary(trades, group_cols):
    rows=[]
    for keys,g in trades.groupby(group_cols, sort=True):
        if not isinstance(keys, tuple): keys=(keys,)
        row=dict(zip(group_cols,keys)); row.update(summarize_group(g)); rows.append(row)
    return pd.DataFrame(rows)


def main():
    months=bt.month_list()
    bt.download_all(months)
    m=bt.load_all(months)
    median_spread=float((m.close_ask-m.close_bid).median())
    print("M1",len(m),m.index.min(),m.index.max(),"spread",median_spread)
    events,_,_=bt.build_liquidity_events(m)
    setups=bt.make_setups(m,events)
    print("BASE SETUPS",setups.groupby(["tf","direction"]).size().to_string())

    filtered={}
    for label,(freq,delta) in FILTERS.items():
        sf=attach_trend_state(m,setups,freq,delta,label)
        sf["trend_filter"]=label
        filtered[label]=sf
        print("FILTER",label)
        print(sf.groupby(["tf","direction"]).size().to_string())

    # consensus: both H2 and H4 must agree with trade direction
    h2=attach_trend_state(m,setups,"2h",pd.Timedelta(hours=2),"H2")
    both=attach_trend_state(m,h2,"4h",pd.Timedelta(hours=4),"H4")
    both["trend_filter"]="H2_H4_BOTH"
    filtered["H2_H4_BOTH"]=both
    print("FILTER H2_H4_BOTH")
    print(both.groupby(["tf","direction"]).size().to_string())

    all_trades=[]; all_setups=[]
    for label,sf in filtered.items():
        tr=bt.simulate_trades(m,sf,median_spread)
        tr["trend_filter"]=label
        all_trades.append(tr)
        all_setups.append(sf)
        print(label,"trades",len(tr))

    trades=pd.concat(all_trades,ignore_index=True)
    setups_f=pd.concat(all_setups,ignore_index=True)

    summary=make_summary(trades,["trend_filter","tf","fib","rr_target"])
    direction=make_summary(trades,["trend_filter","tf","fib","rr_target","direction"])
    annual=make_summary(trades.assign(year=trades.entry_time.dt.year),["trend_filter","tf","fib","rr_target","year"])
    level_exp=trades.assign(level_type=trades.level_types.str.split("+")).explode("level_type")
    levels=make_summary(level_exp,["trend_filter","tf","fib","rr_target","level_type"])

    setup_counts=(setups_f.groupby(["trend_filter","tf","direction"]).size().rename("setups").reset_index())
    summary.to_csv(OUT/"summary.csv",index=False)
    direction.to_csv(OUT/"direction.csv",index=False)
    annual.to_csv(OUT/"annual.csv",index=False)
    levels.to_csv(OUT/"levels.csv",index=False)
    setup_counts.to_csv(OUT/"setup_counts.csv",index=False)
    setups_f.to_csv(OUT/"setups_filtered.csv",index=False)
    trades.to_csv(OUT/"trades.csv",index=False)

    best=summary.sort_values(["profit_factor","expectancy_R"],ascending=False).groupby("trend_filter").head(8)
    best.to_csv(OUT/"best_by_filter.csv",index=False)

    meta={
        "source":"Dukascopy via kevingtlin/Market-Data-Lab public GitHub dataset",
        "test_start":str(bt.TEST_START),"test_end":str(bt.TEST_END),"m1_rows":len(m),"median_spread":median_spread,
        "base_strategy":"same v3 liquidity sweep -> BOS -> Fibonacci retest -> fixed RR",
        "trend_rule":"At BOS time, use last fully closed H2 or H4 candle. LONG only if that close > SMA200 of same timeframe; SHORT only if close < SMA200. SMA200 uses 200 fully closed HTF candles. No EMA50 ordering requirement.",
        "tested_filters":["H2_SMA200","H4_SMA200","H2_H4_BOTH"],
        "trigger_timeframes":["M3","M5","M15"],"fibs":[0.382,0.5,0.65,0.75],"rrs":[2.0,2.5,3.0]
    }
    (OUT/"meta.json").write_text(json.dumps(meta,indent=2,default=str))
    print("=== BEST BY FILTER ===")
    print(best.to_string(index=False))
    print("=== SETUP COUNTS ===")
    print(setup_counts.to_string(index=False))
    print("BEST_JSON="+best.to_json(orient="records"))
    print("SETUP_JSON="+setup_counts.to_json(orient="records"))
    print("META_JSON="+json.dumps(meta))

if __name__=="__main__":
    main()
