export default function Trending({ trending }) {
  if (!trending.length) return null;
  return (
    <div style={S.card}>
      <div style={S.title}>🔥 Trending</div>
      {trending.slice(0, 7).map((c, i) => (
        <div key={c.id} style={S.row}>
          <div style={S.rank}>#{i + 1}</div>
          <img src={c.small} alt={c.name} style={S.icon} />
          <div style={S.name}>{c.name}</div>
          <div style={S.sym}>{c.symbol}</div>
          {c.data?.price_change_percentage_24h?.usd !== undefined && (
            <div style={{ ...S.chg, color: c.data.price_change_percentage_24h.usd >= 0 ? "#4ade80" : "#f87171" }}>
              {c.data.price_change_percentage_24h.usd >= 0 ? "▲" : "▼"}
              {Math.abs(c.data.price_change_percentage_24h.usd).toFixed(1)}%
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const S = {
  card: { background:"#0f0f0f", border:"1px solid #1a1a1a", borderRadius:12, padding:"14px 16px" },
  title:{ fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:10 },
  row:  { display:"flex", alignItems:"center", gap:8, padding:"6px 0", borderBottom:"1px solid #111" },
  rank: { fontSize:11, color:"#334155", width:20, textAlign:"right", flexShrink:0 },
  icon: { width:20, height:20, borderRadius:"50%", flexShrink:0 },
  name: { fontSize:13, color:"#cbd5e1", fontWeight:500, flex:1 },
  sym:  { fontSize:10, color:"#475569" },
  chg:  { fontSize:11, fontWeight:600, flexShrink:0 },
};
