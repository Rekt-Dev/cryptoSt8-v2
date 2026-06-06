import { useEffect, useState } from "react";
import { fetchCoinDetail } from "../api";

const fmt  = n => n >= 1 ? `$${Number(n).toLocaleString(undefined,{maximumFractionDigits:2})}` : `$${Number(n).toFixed(5)}`;
const fmtB = n => n >= 1e9 ? `$${(n/1e9).toFixed(2)}B` : `$${(n/1e6).toFixed(2)}M`;

export default function CoinModal({ coinId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoinDetail(coinId).then(d => { setData(d); setLoading(false); });
  }, [coinId]);

  // close on backdrop click
  const onBackdrop = e => { if (e.target === e.currentTarget) onClose(); };

  // close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div style={S.backdrop} onClick={onBackdrop}>
      <div style={S.modal}>
        <button style={S.close} onClick={onClose}>✕</button>

        {loading || !data ? (
          <div style={{ color:"#475569", padding:40, textAlign:"center" }}>Loading…</div>
        ) : (
          <ModalContent data={data} />
        )}
      </div>
    </div>
  );
}

function ModalContent({ data }) {
  const { detail, chart } = data;
  const m = detail.market_data;
  const prices = chart.prices ?? [];
  const up = m.price_change_percentage_24h >= 0;

  return (
    <div>
      {/* Header */}
      <div style={S.header}>
        <img src={detail.image?.large} alt={detail.symbol} style={S.logo} />
        <div>
          <div style={S.name}>{detail.name}</div>
          <div style={S.sym}>{detail.symbol?.toUpperCase()} · Rank #{detail.market_cap_rank}</div>
        </div>
        <div style={{ marginLeft:"auto", textAlign:"right" }}>
          <div style={S.price}>{fmt(m.current_price?.usd)}</div>
          <div style={{ color: up ? "#4ade80" : "#f87171", fontSize:13, fontWeight:600 }}>
            {up ? "▲" : "▼"} {Math.abs(m.price_change_percentage_24h).toFixed(2)}% 24h
          </div>
        </div>
      </div>

      {/* 30-day chart */}
      <div style={{ marginBottom:20 }}>
        <div style={S.sectionLabel}>30-Day Price</div>
        <PriceChart prices={prices} up={up} />
      </div>

      {/* Stats grid */}
      <div style={S.statsGrid}>
        <Stat label="Market Cap"       value={fmtB(m.market_cap?.usd)} />
        <Stat label="24h Volume"       value={fmtB(m.total_volume?.usd)} />
        <Stat label="All-Time High"    value={fmt(m.ath?.usd)} sub={`${m.ath_change_percentage?.usd?.toFixed(1)}% from ATH`} />
        <Stat label="All-Time Low"     value={fmt(m.atl?.usd)} />
        <Stat label="Circulating"      value={`${(m.circulating_supply/1e6).toFixed(2)}M`} />
        <Stat label="Max Supply"       value={m.max_supply ? `${(m.max_supply/1e6).toFixed(2)}M` : "∞"} />
        <Stat label="7d Change"        value={`${m.price_change_percentage_7d?.toFixed(2)}%`} color={m.price_change_percentage_7d >= 0 ? "#4ade80" : "#f87171"} />
        <Stat label="30d Change"       value={`${m.price_change_percentage_30d?.toFixed(2)}%`} color={m.price_change_percentage_30d >= 0 ? "#4ade80" : "#f87171"} />
      </div>

      {/* Description */}
      {detail.description?.en && (
        <div style={{ marginTop:16 }}>
          <div style={S.sectionLabel}>About</div>
          <div style={S.desc}
            dangerouslySetInnerHTML={{ __html: detail.description.en.split(". ").slice(0,3).join(". ") + "." }}
          />
        </div>
      )}

      {/* Links */}
      <div style={S.links}>
        {detail.links?.homepage?.[0] && <a href={detail.links.homepage[0]} target="_blank" rel="noreferrer" style={S.link}>Website</a>}
        {detail.links?.blockchain_site?.[0] && <a href={detail.links.blockchain_site[0]} target="_blank" rel="noreferrer" style={S.link}>Explorer</a>}
        {detail.links?.subreddit_url && <a href={detail.links.subreddit_url} target="_blank" rel="noreferrer" style={S.link}>Reddit</a>}
        {detail.links?.repos_url?.github?.[0] && <a href={detail.links.repos_url.github[0]} target="_blank" rel="noreferrer" style={S.link}>GitHub</a>}
      </div>
    </div>
  );
}

function Stat({ label, value, sub, color }) {
  return (
    <div style={S.stat}>
      <div style={S.statLabel}>{label}</div>
      <div style={{ ...S.statVal, color: color ?? "#f1f5f9" }}>{value}</div>
      {sub && <div style={S.statSub}>{sub}</div>}
    </div>
  );
}

function PriceChart({ prices, up }) {
  if (!prices.length) return null;
  const vals = prices.map(p => p[1]);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const W = 560, H = 120;
  const pts = vals.map((p, i) => {
    const x = (i / (vals.length - 1)) * W;
    const y = H - ((p - min) / (max - min || 1)) * H;
    return `${x},${y}`;
  }).join(" ");
  const color = up ? "#4ade80" : "#f87171";
  const fillId = `grad-${up}`;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H+10}`} style={{ display:"block" }}>
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${H} ${pts} ${W},${H}`} fill={`url(#${fillId})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </svg>
  );
}

const S = {
  backdrop:    { position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 },
  modal:       { background:"#0f0f0f", border:"1px solid #1e1e1e", borderRadius:16, padding:"24px 28px", width:"100%", maxWidth:620, maxHeight:"90vh", overflowY:"auto", position:"relative" },
  close:       { position:"absolute", top:14, right:16, background:"none", border:"none", color:"#475569", fontSize:18, cursor:"pointer", lineHeight:1 },
  header:      { display:"flex", alignItems:"center", gap:14, marginBottom:20 },
  logo:        { width:48, height:48, borderRadius:"50%" },
  name:        { fontSize:20, fontWeight:800, color:"#f1f5f9" },
  sym:         { fontSize:12, color:"#475569", marginTop:2 },
  price:       { fontSize:22, fontWeight:800, color:"#f1f5f9" },
  sectionLabel:{ fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:8 },
  statsGrid:   { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 },
  stat:        { background:"#141414", borderRadius:8, padding:"10px 12px" },
  statLabel:   { fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 },
  statVal:     { fontSize:14, fontWeight:700 },
  statSub:     { fontSize:10, color:"#475569", marginTop:2 },
  desc:        { fontSize:12, color:"#94a3b8", lineHeight:1.7 },
  links:       { display:"flex", gap:8, marginTop:16, flexWrap:"wrap" },
  link:        { fontSize:11, color:"#60a5fa", border:"1px solid #1e3a5f", borderRadius:6, padding:"4px 10px", textDecoration:"none" },
};
