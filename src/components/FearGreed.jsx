const COLORS = { "Extreme Fear":"#f87171", "Fear":"#fb923c", "Neutral":"#fbbf24", "Greed":"#4ade80", "Extreme Greed":"#22c55e" };

export default function FearGreed({ fearGreed }) {
  if (!fearGreed) return null;
  const val = Number(fearGreed.value);
  const color = COLORS[fearGreed.value_classification] ?? "#94a3b8";
  const angle = (val / 100) * 180 - 90;

  return (
    <div style={S.card}>
      <div style={S.title}>Fear & Greed</div>
      <div style={{ position:"relative", width:140, margin:"0 auto" }}>
        <svg viewBox="0 0 140 80" width={140} height={80}>
          {/* background arc */}
          <path d="M 10 70 A 60 60 0 0 1 130 70" fill="none" stroke="#1a1a1a" strokeWidth={14} strokeLinecap="round" />
          {/* colored arc */}
          <path d="M 10 70 A 60 60 0 0 1 130 70" fill="none" stroke={color} strokeWidth={14} strokeLinecap="round"
            strokeDasharray={`${val * 1.885} 188.5`} />
          {/* needle */}
          <line
            x1={70} y1={70}
            x2={70 + 45 * Math.cos((angle * Math.PI) / 180)}
            y2={70 + 45 * Math.sin((angle * Math.PI) / 180)}
            stroke="#e2e8f0" strokeWidth={2} strokeLinecap="round"
          />
          <circle cx={70} cy={70} r={4} fill="#e2e8f0" />
        </svg>
        <div style={{ textAlign:"center", marginTop:4 }}>
          <div style={{ fontSize:32, fontWeight:800, color, lineHeight:1 }}>{val}</div>
          <div style={{ fontSize:12, color, marginTop:2, fontWeight:600 }}>{fearGreed.value_classification}</div>
          <div style={{ fontSize:10, color:"#475569", marginTop:4 }}>Updated {fearGreed.time_until_update ? `in ${Math.round(fearGreed.time_until_update/3600)}h` : "recently"}</div>
        </div>
      </div>
    </div>
  );
}

const S = {
  card:  { background:"#0f0f0f", border:"1px solid #1a1a1a", borderRadius:12, padding:"14px 16px" },
  title: { fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:12 },
};
