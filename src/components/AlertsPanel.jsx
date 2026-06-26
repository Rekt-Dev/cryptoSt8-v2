import { useState, useEffect } from "react";

const fmt = (n) => n >= 1
  ? `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
  : `$${Number(n).toFixed(5)}`;

export default function AlertsPanel({ alerts, markets, topic, setTopic, addAlert, removeAlert, requestPermission, onClose }) {
  const [coin,      setCoin]      = useState("");
  const [condition, setCondition] = useState("above");
  const [price,     setPrice]     = useState("");
  const [topicDraft,setTopicDraft]= useState(topic);
  const [notifPerm, setNotifPerm] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );

  useEffect(() => { setTopicDraft(topic); }, [topic]);

  async function handleEnableNotifs() {
    await requestPermission();
    setNotifPerm(Notification.permission);
  }

  function handleAdd(e) {
    e.preventDefault();
    if (!coin || !price) return;
    const m = markets.find(m => m.id === coin);
    if (!m) return;
    addAlert(m.id, m.name, m.symbol, m.image, condition, price);
    setPrice("");
  }

  const selectedCoin = markets.find(m => m.id === coin);

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.panel} onClick={e => e.stopPropagation()}>
        <div style={S.header}>
          <span style={S.title}>Price Alerts</span>
          <button style={S.close} onClick={onClose}>✕</button>
        </div>

        {/* ntfy topic */}
        <div style={S.section}>
          <div style={S.label}>ntfy.sh topic (for phone/watch)</div>
          <div style={{ display:"flex", gap:6 }}>
            <input
              style={S.input}
              placeholder="your-topic-name"
              value={topicDraft}
              onChange={e => setTopicDraft(e.target.value)}
            />
            <button style={S.btn} onClick={() => setTopic(topicDraft)}>Save</button>
          </div>
          {topic && (
            <div style={S.hint}>
              Subscribe at ntfy.sh/{topic} or in the ntfy app
            </div>
          )}
        </div>

        {/* browser notif permission */}
        {notifPerm !== "granted" && notifPerm !== "unsupported" && (
          <div style={S.section}>
            <button style={{ ...S.btn, width:"100%", background:"#1d4ed8" }} onClick={handleEnableNotifs}>
              Enable browser notifications
            </button>
          </div>
        )}

        {/* add alert form */}
        <div style={S.section}>
          <div style={S.label}>New alert</div>
          <form onSubmit={handleAdd} style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <select style={S.input} value={coin} onChange={e => setCoin(e.target.value)}>
              <option value="">Select coin…</option>
              {markets.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.symbol.toUpperCase()}) — {fmt(m.current_price)}
                </option>
              ))}
            </select>
            <div style={{ display:"flex", gap:6 }}>
              <select style={{ ...S.input, flex:1 }} value={condition} onChange={e => setCondition(e.target.value)}>
                <option value="above">Above</option>
                <option value="below">Below</option>
              </select>
              <input
                style={{ ...S.input, flex:2 }}
                type="number"
                step="any"
                placeholder={selectedCoin ? fmt(selectedCoin.current_price).replace("$","") : "price"}
                value={price}
                onChange={e => setPrice(e.target.value)}
              />
            </div>
            <button style={{ ...S.btn, background: price && coin ? "#16a34a" : "#1a1a1a" }} type="submit">
              + Add Alert
            </button>
          </form>
        </div>

        {/* alert list */}
        <div style={S.section}>
          <div style={S.label}>Active ({alerts.length})</div>
          {alerts.length === 0 && <div style={{ color:"#475569", fontSize:12 }}>No alerts set.</div>}
          {alerts.map(a => (
            <div key={a.id} style={S.alertRow}>
              <img src={a.coinImage} alt={a.coinSymbol} style={S.icon} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color:"#f1f5f9" }}>
                  {a.coinSymbol.toUpperCase()}
                </div>
                <div style={{ fontSize:11, color: a.condition === "above" ? "#4ade80" : "#f87171" }}>
                  {a.condition === "above" ? "▲ above" : "▼ below"} {fmt(a.price)}
                </div>
              </div>
              <button style={S.remove} onClick={() => removeAlert(a.id)}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const S = {
  overlay: {
    position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:100,
    display:"flex", justifyContent:"flex-end",
  },
  panel: {
    width: "min(360px, 100vw)",
    background:"#0f0f0f", borderLeft:"1px solid #1a1a1a",
    height:"100dvh", overflowY:"auto",
    display:"flex", flexDirection:"column", gap:0,
  },
  header: {
    display:"flex", justifyContent:"space-between", alignItems:"center",
    padding:"16px 16px 12px", borderBottom:"1px solid #1a1a1a", position:"sticky", top:0, background:"#0f0f0f",
  },
  title:   { fontSize:15, fontWeight:700, color:"#f1f5f9" },
  close:   { background:"none", border:"none", color:"#475569", fontSize:16, cursor:"pointer", padding:"4px 8px" },
  section: { padding:"12px 16px", borderBottom:"1px solid #111" },
  label:   { fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 },
  input: {
    background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:8,
    color:"#f1f5f9", padding:"8px 10px", fontSize:13, width:"100%", outline:"none",
  },
  btn: {
    background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:8,
    color:"#f1f5f9", padding:"8px 14px", fontSize:13, cursor:"pointer", whiteSpace:"nowrap",
  },
  hint:    { fontSize:10, color:"#475569", marginTop:6 },
  alertRow:{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid #111" },
  icon:    { width:24, height:24, borderRadius:"50%" },
  remove:  { background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:13, padding:"2px 6px" },
};
