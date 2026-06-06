import { useEffect, useState } from "react";
import { fetchFearGreedHistory } from "../api";

const COLORS = { "Extreme Fear":"#f87171", "Fear":"#fb923c", "Neutral":"#fbbf24", "Greed":"#4ade80", "Extreme Greed":"#22c55e" };

const LEVELS = [
  { range:"0–24",  label:"Extreme Fear",  color:"#f87171", desc:"Investors are extremely worried. Historically a buying opportunity." },
  { range:"25–44", label:"Fear",          color:"#fb923c", desc:"Market sentiment is negative. Caution advised." },
  { range:"45–55", label:"Neutral",       color:"#fbbf24", desc:"Market is balanced between fear and greed." },
  { range:"56–74", label:"Greed",         color:"#4ade80", desc:"Investors are getting greedy. Volatility may increase." },
  { range:"75–100",label:"Extreme Greed", color:"#22c55e", desc:"Market is euphoric. Historically a sell signal." },
];

export default function FearGreedModal({ onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFearGreedHistory().then(d => { setHistory(d); setLoading(false); });
  }, []);

  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const onBackdrop = e => { if (e.target === e.currentTarget) onClose(); };

  return (
    <div style={S.backdrop} onClick={onBackdrop}>
      <div style={S.modal}>
        <button style={S.close} onClick={onClose}>✕</button>
        <div style={S.title}>Fear & Greed Index</div>
        <div style={S.subtitle}>Crypto market sentiment — last 30 days</div>

        {loading ? (
          <div style={{ color:"#475569", padding:40, textAlign:"center" }}>Loading…</div>
        ) : (
          <>
            {/* Bar chart */}
            <div style={{ marginBottom:24 }}>
              <div style={S.sectionLabel}>30-Day History</div>
              <BarChart history={history} />
            </div>

            {/* Recent values table */}
            <div style={{ marginBottom:24 }}>
              <div style={S.sectionLabel}>Recent Readings</div>
              <div style={S.table}>
                {history.slice(-10).reverse().map((d, i) => {
                  const color = COLORS[d.value_classification] ?? "#94a3b8";
                  const date = new Date(Number(d.timestamp) * 1000).toLocaleDateString(undefined, { month:"short", day:"numeric" });
                  return (
                    <div key={i} style={S.row}>
                      <span style={S.dateCol}>{date}</span>
                      <span style={{ ...S.valCol, color }}>{d.value}</span>
                      <span style={{ ...S.classCol, color }}>{d.value_classification}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* What the levels mean */}
            <div>
              <div style={S.sectionLabel}>What Do the Levels Mean?</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {LEVELS.map(l => (
                  <div key={l.label} style={S.level}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                      <span style={{ ...S.badge, background: l.color + "22", color: l.color }}>{l.range}</span>
                      <span style={{ fontSize:13, fontWeight:700, color: l.color }}>{l.label}</span>
                    </div>
                    <div style={S.levelDesc}>{l.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BarChart({ history }) {
  const W = 560, H = 100;
  const n = history.length;
  const barW = Math.floor(W / n) - 1;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display:"block" }}>
      {history.map((d, i) => {
        const val = Number(d.value);
        const color = COLORS[d.value_classification] ?? "#94a3b8";
        const bh = (val / 100) * H;
        const x = i * (barW + 1);
        return (
          <rect key={i} x={x} y={H - bh} width={barW} height={bh}
            fill={color} opacity={0.8} rx={2} />
        );
      })}
    </svg>
  );
}

const S = {
  backdrop:    { position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 },
  modal:       { background:"#0f0f0f", border:"1px solid #1e1e1e", borderRadius:16, padding:"24px 28px", width:"100%", maxWidth:600, maxHeight:"90vh", overflowY:"auto", position:"relative" },
  close:       { position:"absolute", top:14, right:16, background:"none", border:"none", color:"#475569", fontSize:18, cursor:"pointer", lineHeight:1 },
  title:       { fontSize:20, fontWeight:800, color:"#f1f5f9", marginBottom:4 },
  subtitle:    { fontSize:12, color:"#475569", marginBottom:20 },
  sectionLabel:{ fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:8 },
  table:       { display:"flex", flexDirection:"column", gap:4 },
  row:         { display:"flex", alignItems:"center", gap:12, padding:"6px 10px", background:"#141414", borderRadius:6 },
  dateCol:     { fontSize:12, color:"#64748b", width:60 },
  valCol:      { fontSize:14, fontWeight:700, width:36 },
  classCol:    { fontSize:12, fontWeight:600 },
  level:       { background:"#141414", borderRadius:8, padding:"10px 12px" },
  badge:       { fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:4 },
  levelDesc:   { fontSize:12, color:"#64748b", lineHeight:1.6 },
};
