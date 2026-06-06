import { useEffect, useState, useCallback } from "react";
import "./index.css";
import { fetchPrices, fetchMarkets, fetchTrending, fetchGlobal, fetchFearGreed } from "./api";
import Ticker     from "./components/Ticker";
import GlobalBar  from "./components/GlobalBar";
import PriceCards from "./components/PriceCards";
import FearGreed  from "./components/FearGreed";
import Trending   from "./components/Trending";
import TopMovers  from "./components/TopMovers";

const REFRESH = 60_000; // 60s

export default function App() {
  const [markets,   setMarkets]   = useState([]);
  const [global,    setGlobal]    = useState(null);
  const [fearGreed, setFearGreed] = useState(null);
  const [trending,  setTrending]  = useState([]);
  const [lastUpdate,setLastUpdate]= useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const load = useCallback(async () => {
    try {
      const [m, g, fg, t] = await Promise.all([
        fetchMarkets(),
        fetchGlobal(),
        fetchFearGreed(),
        fetchTrending(),
      ]);
      setMarkets(m);
      setGlobal(g);
      setFearGreed(fg);
      setTrending(t);
      setLastUpdate(new Date());
      setError(null);
    } catch (e) {
      setError("API rate limited — refreshing soon…");
    } finally {
      setLoading(false);
    }
  }, []);

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
      {/* ── Ticker strip ── */}
      <Ticker markets={markets} />

      {/* ── Header ── */}
      <div style={S.header}>
        <div>
          <div style={S.title}>cryptoSt8</div>
          <div style={S.sub}>
            {lastUpdate ? `updated ${lastUpdate.toLocaleTimeString()}` : ""}
            {error && <span style={{ color:"#f87171", marginLeft:8 }}>{error}</span>}
          </div>
        </div>
        <GlobalBar global={global} />
      </div>

      {/* ── Main grid ── */}
      <div style={S.grid}>
        <div style={S.col}>
          <FearGreed fearGreed={fearGreed} />
          <Trending trending={trending} />
        </div>
        <div style={{ ...S.col, flex:2 }}>
          <PriceCards markets={markets} />
        </div>
        <div style={S.col}>
          <TopMovers markets={markets} />
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={S.footer}>
        <span style={S.footerBrand}>⚔ Invictus Crypto Strategies</span>
        <span style={S.footerMeta}>Data via CoinGecko · Updates every 60s · Not financial advice</span>
      </div>
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
};
