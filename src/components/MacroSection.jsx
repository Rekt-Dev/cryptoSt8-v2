import { useFredData, SECTION_LABELS } from "../hooks/useFredData";

const fmtVal = (v, unit) => {
  if (unit === "K") return `${Number(v).toLocaleString()}K`;
  if (unit === "%") return `${Number(v).toFixed(2)}%`;
  return Number(v).toFixed(2);
};

function MacroCard({ item }) {
  const change = item.prev != null ? item.value - item.prev : null;
  const up = change >= 0;
  const date = item.date ? new Date(item.date).toLocaleDateString("en-US", { month:"short", year:"2-digit" }) : "";

  return (
    <div style={S.card}>
      <div style={S.label}>{item.label}</div>
      <div style={S.value}>{fmtVal(item.value, item.unit)}</div>
      <div style={S.bottom}>
        {change != null && (
          <span style={{ color: up ? "#4ade80" : "#f87171", fontSize:10 }}>
            {up ? "▲" : "▼"} {Math.abs(change).toFixed(2)}{item.unit}
          </span>
        )}
        <span style={S.date}>{date}</span>
      </div>
    </div>
  );
}

export default function MacroSection() {
  const data = useFredData();

  if (!Object.keys(data).length) return (
    <div style={{ padding:"16px 20px", color:"#1e293b", fontSize:11 }}>loading macro data…</div>
  );

  const sections = ["rates", "inflation", "labor", "housing", "gdp"];

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <span style={S.title}>Macro & Economic Data</span>
        <span style={S.sub}>for the normies getting rich rn</span>
      </div>
      {sections.map(sec => {
        const items = Object.values(data).filter(d => d.section === sec);
        if (!items.length) return null;
        return (
          <div key={sec} style={S.section}>
            <div style={S.secLabel}>{SECTION_LABELS[sec]}</div>
            <div style={S.grid}>
              {items.map(item => <MacroCard key={item.id} item={item} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const S = {
  wrap:     { padding:"16px 20px 32px", borderTop:"1px solid #0d0d0d" },
  header:   { display:"flex", alignItems:"baseline", gap:12, marginBottom:16 },
  title:    { fontSize:10, color:"#1e293b", textTransform:"uppercase", letterSpacing:"0.12em" },
  sub:      { fontSize:10, color:"#172033", fontStyle:"italic" },
  section:  { marginBottom:20 },
  secLabel: { fontSize:9, color:"#1e293b", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:8 },
  grid:     { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(140px, 1fr))", gap:8 },
  card:     { background:"#080808", border:"1px solid #0f0f0f", borderRadius:10, padding:"10px 12px" },
  label:    { fontSize:10, color:"#334155", marginBottom:4 },
  value:    { fontSize:15, fontWeight:700, color:"#475569" },
  bottom:   { display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:4 },
  date:     { fontSize:9, color:"#1e293b" },
};
