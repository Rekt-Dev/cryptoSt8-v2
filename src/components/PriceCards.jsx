import { useState, useEffect, useRef } from "react";
import ChartModal from "./ChartModal";

const fmt  = (n) => n >= 1 ? `$${Number(n).toLocaleString(undefined,{maximumFractionDigits:2})}` : `$${Number(n).toFixed(5)}`;
const fmtB = (n) => `$${(n/1e9).toFixed(1)}B`;

export default function PriceCards({ markets, interval, openChart, onAddAlert, flashOn }) {
  const [chartCoin, setChartCoin] = useState(null);
  const [flashes,   setFlashes]   = useState({});
  const prevPrices  = useRef({});

  useEffect(() => { if (openChart) setChartCoin(openChart); }, [openChart]);

  useEffect(() => {
    const newFlashes = {};
    markets.forEach(c => {
      const prev = prevPrices.current[c.id];
      if (prev !== undefined && prev !== c.current_price) {
        newFlashes[c.id] = c.current_price > prev ? "flash-up" : "flash-down";
      }
      prevPrices.current[c.id] = c.current_price;
    });
    if (Object.keys(newFlashes).length) {
      setFlashes(newFlashes);
      const t = setTimeout(() => setFlashes({}), 650);
      return () => clearTimeout(t);
    }
  }, [markets]);

  if (!markets.length) return <div style={{ color:"#475569" }}>Loading…</div>;
  return (
    <>
      <div>
        <div style={S.title}>Markets</div>
        <div style={S.grid}>
          {markets.map(c => {
            const up  = c.price_change_percentage_24h >= 0;
            const up7 = c.price_change_percentage_7d_in_currency >= 0;
            const spark = c.sparkline_in_7d?.price ?? [];
            return (
              <div key={c.id} style={S.card}
                onClick={() => setChartCoin(c)}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#2a2a2a"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#1a1a1a"}>
                <div style={S.top}>
                  <div style={S.left}>
                    <img src={c.image} alt={c.symbol} style={S.icon} />
                    <div>
                      <div style={S.name}>{c.name}</div>
                      <div style={S.sym}>{c.symbol.toUpperCase()}</div>
                    </div>
                  </div>
                  <div style={S.right}>
                    <div style={S.price} className={flashOn ? (flashes[c.id] || "") : ""}>{fmt(c.current_price)}</div>
                    <div style={{ ...S.chg, color: up ? "#4ade80" : "#f87171" }}>
                      {up ? "▲" : "▼"} {Math.abs(c.price_change_percentage_24h).toFixed(2)}%
                    </div>
                  </div>
                </div>
                <Sparkline prices={spark} up={up} interval={interval} />
                <div style={S.bottom}>
                  <span style={S.meta}>MCap {fmtB(c.market_cap)}</span>
                  <span style={{ ...S.meta, color: up7 ? "#4ade80" : "#f87171" }}>
                    7d {up7 ? "+" : ""}{c.price_change_percentage_7d_in_currency?.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {chartCoin && <ChartModal coin={chartCoin} interval={interval} onClose={() => setChartCoin(null)} onAddAlert={onAddAlert} />}
    </>
  );
}

const SLICE = { "15": 8, "60": 24, "240": 48, "D": 168 };

function Sparkline({ prices, up, interval }) {
  if (!prices.length) return null;
  const sliced = prices.slice(-(SLICE[interval] ?? 168));
  const min = Math.min(...sliced);
  const max = Math.max(...sliced);
  const w = 120, h = 36;
  const pts = sliced.filter((_, i) => i % Math.max(1, Math.floor(sliced.length / 30)) === 0).map((p, i, arr) => {
    const x = (i / (arr.length - 1)) * w;
    const y = h - ((p - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ display:"block", margin:"8px 0" }}>
      <polyline points={pts} fill="none" stroke={up ? "#4ade80" : "#f87171"} strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}

const S = {
  title: { fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:10 },
  grid:  { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:10 },
  card:  { background:"#0f0f0f", border:"1px solid #1a1a1a", borderRadius:12, padding:"12px 14px", cursor:"pointer", transition:"border-color 0.15s" },
  top:   { display:"flex", justifyContent:"space-between", alignItems:"flex-start" },
  left:  { display:"flex", alignItems:"center", gap:8 },
  icon:  { width:28, height:28, borderRadius:"50%" },
  name:  { fontSize:13, fontWeight:600, color:"#f1f5f9" },
  sym:   { fontSize:10, color:"#475569", textTransform:"uppercase" },
  right: { textAlign:"right" },
  price: { fontSize:14, fontWeight:700, color:"#f1f5f9" },
  chg:   { fontSize:11, fontWeight:600, marginTop:2 },
  bottom:{ display:"flex", justifyContent:"space-between" },
  meta:  { fontSize:10, color:"#475569" },
};
