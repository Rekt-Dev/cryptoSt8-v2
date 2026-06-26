import { useEffect, useState, useCallback } from "react";
import "./index.css";
import { fetchMarkets, fetchTrending, fetchGlobal, fetchFearGreed, COINS } from "./api";
import { useAlerts } from "./hooks/useAlerts";
import Ticker      from "./components/Ticker";
import GlobalBar   from "./components/GlobalBar";
import PriceCards  from "./components/PriceCards";
import FearGreed   from "./components/FearGreed";
import Trending    from "./components/Trending";
import TopMovers   from "./components/TopMovers";
import AlertsPanel from "./components/AlertsPanel";

const REFRESH = 60_000;

export default function App() {
  const [markets,    setMarkets]    = useState([]);
  const [global,     setGlobal]     = useState(null);
  const [fearGreed,  setFearGreed]  = useState(null);
  const [trending,   setTrending]   = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [showAlerts, setShowAlerts] = useState(false);

  const { alerts, topic, setTopic, addAlert, removeAlert, checkAlerts, requestPermission } = useAlerts();

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
      <Ticker markets={markets} />

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
          <button style={S.bellBtn} onClick={() => setShowAlerts(true)}>
            🔔
            {alerts.length > 0 && <span style={S.badge}>{alerts.length}</span>}
          </button>
        </div>
      </div>

      <div style={S.grid}>
        <div style={S.col} className="side-col">
          <FearGreed fearGreed={fearGreed} />
          <Trending trending={trending} />
        </div>
        <div style={{ ...S.col, flex:2 }}>
          <PriceCards markets={markets} />
        </div>
        <div style={S.col} className="side-col">
          <TopMovers markets={markets} />
        </div>
      </div>

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
  grid:        { display:"flex", gap:16, padding:"16px 20px", flexWrap:"wrap" },
  col:         { display:"flex", flexDirection:"column", gap:12, flex:1, minWidth:220 },
  footer:      { borderTop:"1px solid #1a1a1a", padding:"14px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 },
  footerBrand: { fontSize:13, fontWeight:700, color:"#f1f5f9", letterSpacing:"0.04em" },
  footerMeta:  { fontSize:11, color:"#334155" },
  bellBtn:     { background:"none", border:"1px solid #1a1a1a", borderRadius:8, padding:"6px 10px", cursor:"pointer", fontSize:18, position:"relative", lineHeight:1 },
  badge:       { position:"absolute", top:-6, right:-6, background:"#ef4444", color:"#fff", fontSize:10, fontWeight:700, borderRadius:"50%", width:16, height:16, display:"flex", alignItems:"center", justifyContent:"center" },
};
