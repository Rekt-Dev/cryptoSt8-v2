const fmt = (n) => n >= 1 ? `$${Number(n).toLocaleString(undefined,{maximumFractionDigits:2})}` : `$${Number(n).toFixed(4)}`;

export default function TopMovers({ markets }) {
  if (!markets.length) return null;
  const sorted = [...markets].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
  const gainers = sorted.slice(0, 3);
  const losers  = sorted.slice(-3).reverse();

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <Section title="🚀 Top Gainers" coins={gainers} />
      <Section title="💀 Top Losers"  coins={losers} />
    </div>
  );
}

function Section({ title, coins }) {
  return (
    <div style={S.card}>
      <div style={S.title}>{title}</div>
      {coins.map(c => {
        const up = c.price_change_percentage_24h >= 0;
        return (
          <div key={c.id} style={S.row}>
            <img src={c.image} alt={c.name} style={S.icon} />
            <div style={S.left}>
              <div style={S.name}>{c.name}</div>
              <div style={S.price}>{fmt(c.current_price)}</div>
            </div>
            <div style={{ ...S.chg, color: up ? "#4ade80" : "#f87171" }}>
              {up ? "+" : ""}{c.price_change_percentage_24h.toFixed(2)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

const S = {
  card:  { background:"#0f0f0f", border:"1px solid #1a1a1a", borderRadius:12, padding:"14px 16px" },
  title: { fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:10 },
  row:   { display:"flex", alignItems:"center", gap:10, padding:"7px 0", borderBottom:"1px solid #111" },
  icon:  { width:24, height:24, borderRadius:"50%", flexShrink:0 },
  left:  { flex:1 },
  name:  { fontSize:13, color:"#e2e8f0", fontWeight:500 },
  price: { fontSize:11, color:"#64748b", marginTop:1 },
  chg:   { fontSize:13, fontWeight:700, flexShrink:0 },
};
