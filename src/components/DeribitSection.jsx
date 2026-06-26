import { useDeribitData } from "../hooks/useDeribitData";

function DvolCard({ label, dvol }) {
  if (!dvol) return null;
  const up = dvol.change >= 0;
  return (
    <div style={S.card}>
      <div style={S.cardLabel}>{label} DVOL</div>
      <div style={S.bigVal}>{dvol.value.toFixed(2)}</div>
      <div style={{ ...S.chg, color: up ? "#f87171" : "#4ade80" }}>
        {up ? "▲" : "▼"} {Math.abs(dvol.change).toFixed(2)}
        <span style={S.hint}> {up ? "more fear" : "less fear"}</span>
      </div>
    </div>
  );
}

function TermCard({ item, currency }) {
  if (!item) return null;
  const skewBullish = item.skew != null && item.skew < 0;
  return (
    <div style={S.card}>
      <div style={S.cardLabel}>{currency} {item.label} <span style={S.dim}>({item.daysToExp}d)</span></div>
      <div style={S.bigVal}>{item.atmIv != null ? `${item.atmIv.toFixed(1)}%` : "—"}</div>
      <div style={S.subRow}>
        <span style={S.metaKey}>ATM IV</span>
      </div>
      {item.skew != null && (
        <div style={{ ...S.chg, color: skewBullish ? "#4ade80" : "#f87171", marginTop:4 }}>
          Skew {item.skew > 0 ? "+" : ""}{item.skew.toFixed(1)}%
          <span style={S.hint}> {skewBullish ? "calls bid" : "puts bid"}</span>
        </div>
      )}
      <div style={S.strike}>ATM ${item.strike?.toLocaleString()}</div>
    </div>
  );
}

export default function DeribitSection() {
  const data = useDeribitData();

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <span style={S.title}>Options · Deribit</span>
        <span style={S.sub}>IV · skew · term structure</span>
      </div>

      {!data ? (
        <div style={{ color:"#334155", fontSize:12 }}>loading options data…</div>
      ) : (
        <>
          {/* DVOL */}
          <div style={S.secLabel}>Volatility Index (DVOL)</div>
          <div style={S.grid}>
            <DvolCard label="BTC" dvol={data.btcDvol} />
            <DvolCard label="ETH" dvol={data.ethDvol} />
          </div>

          {/* BTC term structure */}
          {data.btcOptions?.length > 0 && (
            <>
              <div style={S.secLabel}>BTC Term Structure</div>
              <div style={S.grid}>
                {data.btcOptions.map((o, i) => <TermCard key={i} item={o} currency="BTC" />)}
              </div>
            </>
          )}

          {/* ETH term structure */}
          {data.ethOptions?.length > 0 && (
            <>
              <div style={S.secLabel}>ETH Term Structure</div>
              <div style={S.grid}>
                {data.ethOptions.map((o, i) => <TermCard key={i} item={o} currency="ETH" />)}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

const S = {
  wrap:     { padding:"16px 20px", borderTop:"1px solid #1a1a1a" },
  header:   { display:"flex", alignItems:"baseline", gap:12, marginBottom:14 },
  title:    { fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:"0.12em" },
  sub:      { fontSize:10, color:"#334155", fontStyle:"italic" },
  secLabel: { fontSize:9, color:"#334155", textTransform:"uppercase", letterSpacing:"0.12em", margin:"12px 0 8px" },
  grid:     { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))", gap:10 },
  card:     { background:"#0f0f0f", border:"1px solid #1a1a1a", borderRadius:12, padding:"12px 14px" },
  cardLabel:{ fontSize:11, color:"#475569", marginBottom:6 },
  bigVal:   { fontSize:22, fontWeight:700, color:"#f1f5f9" },
  chg:      { fontSize:11, fontWeight:600, marginTop:4 },
  hint:     { fontSize:10, color:"#475569", fontWeight:400 },
  subRow:   { display:"flex", gap:8, marginTop:2 },
  metaKey:  { fontSize:10, color:"#334155" },
  strike:   { fontSize:10, color:"#1e293b", marginTop:6 },
  dim:      { color:"#334155", fontWeight:400 },
};
