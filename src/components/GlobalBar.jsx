const fmtB = n => `$${(n/1e9).toFixed(1)}B`;
const fmtT = n => `$${(n/1e12).toFixed(2)}T`;

export default function GlobalBar({ global }) {
  if (!global) return null;
  const btcD = global.market_cap_percentage?.btc?.toFixed(1);
  const ethD = global.market_cap_percentage?.eth?.toFixed(1);
  return (
    <div style={S.wrap}>
      <Chip label="Total MCap" value={fmtT(global.total_market_cap?.usd ?? 0)} />
      <Chip label="24h Vol"    value={fmtB(global.total_volume?.usd ?? 0)} />
      <Chip label="BTC Dom"   value={`${btcD}%`} color="#f7931a" />
      <Chip label="ETH Dom"   value={`${ethD}%`} color="#627eea" />
      <Chip label="Coins"     value={global.active_cryptocurrencies?.toLocaleString()} />
    </div>
  );
}

function Chip({ label, value, color }) {
  return (
    <div style={S.chip}>
      <div style={S.label}>{label}</div>
      <div style={{ ...S.val, color: color ?? "#e2e8f0" }}>{value}</div>
    </div>
  );
}

const S = {
  wrap:  { display:"flex", gap:16, flexWrap:"wrap" },
  chip:  { display:"flex", flexDirection:"column", alignItems:"flex-end" },
  label: { fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:"0.08em" },
  val:   { fontSize:13, fontWeight:700, marginTop:1 },
};
