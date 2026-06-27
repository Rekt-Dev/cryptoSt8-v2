import { useEffect, useState, useCallback } from "react";
import "./index.css";
import { fetchMarkets, fetchTrending, fetchGlobal, fetchFearGreed, COINS } from "./api";
import { useAlerts } from "./hooks/useAlerts";
import { useRealtimePrices } from "./hooks/useRealtimePrices";
import Ticker      from "./components/Ticker";
import GlobalBar   from "./components/GlobalBar";
import PriceCards  from "./components/PriceCards";
import FearGreed   from "./components/FearGreed";
import Trending    from "./components/Trending";
import TopMovers   from "./components/TopMovers";
import AlertsPanel  from "./components/AlertsPanel";
import TradMarkets  from "./components/TradMarkets";
import MacroSection   from "./components/MacroSection";
import DeribitSection from "./components/DeribitSection";
import EconCalendar   from "./components/EconCalendar";

const REFRESH = 60_000;

export default function App() {
  const [markets,    setMarkets]    = useState([]);
  const [global,     setGlobal]     = useState(null);
  const [fearGreed,  setFearGreed]  = useState(null);
  const [trending,   setTrending]   = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [showAlerts,  setShowAlerts]  = useState(false);
  const [interval,    setInterval]    = useState("240");
  const [tickerCoin,  setTickerCoin]  = useState(null);
  const [flashOn,     setFlashOn]     = useState(false);

  const { alerts, topic, setTopic, addAlert, removeAlert, checkAlerts, requestPermission } = useAlerts();
  useRealtimePrices(setMarkets);

  // ── Wake lock (keeps mobile screen / JS alive) ──
  useEffect(() => {
    let lock = null;
    const acquire = async () => {
      try {
        if ("wakeLock" in navigator) lock = await navigator.wakeLock.request("screen");
      } catch {}
    };
    acquire();
    const onVisible = () => { if (document.visibilityState === "visible") acquire(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { document.removeEventListener("visibilitychange", onVisible); lock?.release(); };
  }, []);

  const load = useCallback(async () => {
    try {
      const [m, g, fg, t] = await Promise.all([
        fetchMarkets(), fetchGlobal(), fetchFearGreed(), fetchTrending(),
      ]);
      const sorted = [...m].sort((a, b) => COINS.indexOf(a.id) - COINS.indexOf(b.id));
      setMarkets(sorted);
      setGlobal(g);
      setFearGreed(fg);
      setTrending(t);
      setLastUpdate(new Date());
      setError(null);
      checkAlerts(m);
    } catch {
      setError("API rate limited — refreshing soon…");
    } finally {
      setLoading(false);
    }
  }, [checkAlerts]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const iv = setInterval(load, REFRESH);
    return () => clearInterval(iv);
  }, [load]);

  if (loading) return (
    <div style={{ minHeight:"100dvh", display:"flex", alignItems:"center", justifyContent:"center", color:"#475569", fontFamily:"monospace" }}>
      loading market data…
    </div>
  );

  return (
    <div style={{ background:"#080808", minHeight:"100dvh" }}>
      <Ticker markets={markets} onCoinClick={c => setTickerCoin(c)} />

      <div style={S.header}>
        <div>
          <div style={S.title}>cryptoSt8</div>
          <div style={S.sub}>
            {lastUpdate ? `updated ${lastUpdate.toLocaleTimeString()}` : ""}
            {error && <span style={{ color:"#f87171", marginLeft:8 }}>{error}</span>}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <GlobalBar global={global} />
          <div style={S.tfRow}>
            {[["15","15m"],["60","1h"],["240","4h"],["D","1d"]].map(([val, label]) => (
              <button key={val} style={{ ...S.tfBtn, ...(interval === val ? S.tfActive : {}) }}
                onClick={() => setInterval(val)}>{label}</button>
            ))}
          </div>
          <button
            style={{ ...S.tfBtn, ...(flashOn ? S.tfActive : {}), marginLeft:4 }}
            onClick={() => setFlashOn(v => !v)}
            title="Toggle price flash"
          >⚡</button>
          <button style={S.bellBtn} onClick={() => setShowAlerts(true)}>
            🔔
            {alerts.length > 0 && <span style={S.badge}>{alerts.length}</span>}
          </button>
        </div>
      </div>

      {/* top strip — Fear&Greed / Trending / TopMovers */}
      <div style={S.topStrip} className="side-col">
        <div style={S.stripCol}><FearGreed fearGreed={fearGreed} /></div>
        <div style={S.stripCol}><Trending trending={trending} /></div>
        <div style={S.stripCol}><TopMovers markets={markets} /></div>
      </div>

      {/* full-width 3-col coin grid */}
      <div style={S.coinWrap}>
        <PriceCards markets={markets} interval={interval} openChart={tickerCoin} onAddAlert={addAlert} flashOn={flashOn} />
      </div>

      <DeribitSection />
      <TradMarkets interval={interval} />
      <EconCalendar />
      <MacroSection />

      <div style={S.footer}>
        <span style={S.footerBrand}>⚔ Invictus Crypto Strategies</span>
        <span style={S.footerMeta}>Data via CoinGecko · Updates every 60s · Not financial advice</span>
      </div>

      {showAlerts && (
        <AlertsPanel
          alerts={alerts}
          markets={markets}
          topic={topic}
          setTopic={setTopic}
          addAlert={addAlert}
          removeAlert={removeAlert}
          requestPermission={requestPermission}
          onClose={() => setShowAlerts(false)}
        />
      )}
    </div>
  );
}

const S = {
  header:      { padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid #1a1a1a" },
  title:       { fontSize:22, fontWeight:800, color:"#fff", letterSpacing:"0.05em" },
  sub:         { fontSize:11, color:"#475569", marginTop:3 },
  topStrip:    { display:"flex", gap:16, padding:"16px 20px", borderBottom:"1px solid #1a1a1a" },
  stripCol:    { flex:1, minWidth:0 },
  coinWrap:    { padding:"16px 20px" },
  footer:      { borderTop:"1px solid #1a1a1a", padding:"14px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 },
  footerBrand: { fontSize:13, fontWeight:700, color:"#f1f5f9", letterSpacing:"0.04em" },
  footerMeta:  { fontSize:11, color:"#334155" },
  tfRow:   { display:"flex", gap:4 },
  tfBtn:   { background:"none", border:"1px solid #1a1a1a", borderRadius:6, color:"#475569", padding:"4px 10px", fontSize:11, fontWeight:600, cursor:"pointer" },
  tfActive:{ border:"1px solid #3b82f6", color:"#3b82f6", background:"#1e3a5f22" },
  bellBtn:     { background:"none", border:"1px solid #1a1a1a", borderRadius:8, padding:"6px 10px", cursor:"pointer", fontSize:18, position:"relative", lineHeight:1 },
  badge:       { position:"absolute", top:-6, right:-6, background:"#ef4444", color:"#fff", fontSize:10, fontWeight:700, borderRadius:"50%", width:16, height:16, display:"flex", alignItems:"center", justifyContent:"center" },
};
