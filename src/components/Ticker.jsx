const fmt = (n) => n >= 1 ? `$${Number(n).toLocaleString(undefined,{maximumFractionDigits:2})}` : `$${Number(n).toFixed(4)}`;

export default function Ticker({ markets, onCoinClick }) {
  if (!markets.length) return null;
  const items = [...markets, ...markets];
  return (
    <div style={S.wrap}>
      <div style={S.track}>
        {items.map((c, i) => {
          const up = c.price_change_percentage_24h >= 0;
          return (
            <div key={i} style={S.item} onClick={() => onCoinClick?.(c)}>
              <img src={c.image} alt={c.symbol} style={S.icon} />
              <span style={S.sym}>{c.symbol.toUpperCase()}</span>
              <span style={S.price}>{fmt(c.current_price)}</span>
              <span style={{ ...S.chg, color: up ? "#4ade80" : "#f87171" }}>
                {up ? "▲" : "▼"}{Math.abs(c.price_change_percentage_24h).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
      `}</style>
    </div>
  );
}

const S = {
  wrap:  { background:"#0a0a0a", borderBottom:"1px solid #1a1a1a", overflow:"hidden", whiteSpace:"nowrap", padding:"8px 0" },
  track: { display:"inline-flex", gap:32, animation:"ticker 80s linear infinite", paddingLeft:16 },
  item:  { display:"inline-flex", alignItems:"center", gap:6, cursor:"pointer" },
  icon:  { width:16, height:16, borderRadius:"50%" },
  sym:   { fontSize:12, color:"#94a3b8", fontWeight:600 },
  price: { fontSize:12, color:"#e2e8f0", fontWeight:600 },
  chg:   { fontSize:11, fontWeight:600 },
};
