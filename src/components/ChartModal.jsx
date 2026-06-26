import { useEffect, useRef, useState } from "react";

// CoinGecko ID → TradingView symbol
const SYMBOL_MAP = {
  "bitcoin":           "BYBIT:BTCUSDT",
  "ethereum":          "BYBIT:ETHUSDT",
  "solana":            "BYBIT:SOLUSDT",
  "binancecoin":       "BYBIT:BNBUSDT",
  "ripple":            "BYBIT:XRPUSDT",
  "cardano":           "BYBIT:ADAUSDT",
  "bitcoin-cash":      "BYBIT:BCHUSDT",
  "avalanche-2":       "BYBIT:AVAXUSDT",
  "near":              "BYBIT:NEARUSDT",
  "algorand":          "BYBIT:ALGOUSDT",
  "litecoin":          "BYBIT:LTCUSDT",
  "aave":              "BYBIT:AAVEUSDT",
  "curve-dao-token":   "BYBIT:CRVUSDT",
  "lido-dao":          "BYBIT:LDOUSDT",
  "uniswap":           "BYBIT:UNIUSDT",
  "chainlink":         "BYBIT:LINKUSDT",
  "ondo-finance":      "BYBIT:ONDOUSDT",
  "pyth-network":      "BYBIT:PYTHUSDT",
  "ethena":            "BYBIT:ENAUSDT",
  "jupiter-ag":        "BYBIT:JUPUSDT",
  "filecoin":          "BYBIT:FILUSDT",
  "arbitrum":          "BYBIT:ARBUSDT",
  "optimism":          "BYBIT:OPUSDT",
  "mantle":            "BYBIT:MNTUSDT",
  "blockstack":        "BYBIT:STXUSDT",
  "celestia":          "BYBIT:TIAUSDT",
  "aptos":             "BYBIT:APTUSDT",
  "sui":               "BYBIT:SUIUSDT",
  "injective-protocol":"BYBIT:INJUSDT",
  "astar":             "BYBIT:ASTRUSDT",
  "hyperliquid":       "BYBIT:HYPEUSDT",
  "dydx":              "BYBIT:DYDXUSDT",
  "worldcoin-wld":     "BYBIT:WLDUSDT",
  "falcon-finance":    "BYBIT:FFUSDT",
  "monero":            "BYBIT:XMRUSDT",
  "zcash":             "BYBIT:ZECUSDT",
  "apecoin":           "BYBIT:APEUSDT",
  "enjincoin":         "BYBIT:ENJUSDT",
  "tron":              "BYBIT:TRXUSDT",
  "plasma":            "BYBIT:XPLUSDT",
  "dogecoin":          "BYBIT:DOGEUSDT",
  "shiba-inu":         "BYBIT:SHIBUSDT",
  "pepe":              "BYBIT:PEPEUSDT",
  "dogwifcoin":        "BYBIT:WIFUSDT",
  "floki":             "BYBIT:FLOKIUSDT",
  "official-trump":    "BYBIT:TRUMPUSDT",
  "chill-guy":         "MEXC:CHILLGUYUSDT",
  "fartcoin":          "MEXC:FARTCOINUSDT",
  "gigachad":          "MEXC:GIGAUSDT",
  "spx6900":           "MEXC:SPXUSDT",
  "pudgy-penguins":    "BYBIT:PENGUUSDT",
  "useless":           "MEXC:USELESSUSDT",
  "broccoli-714":      "BINANCE:BROCCOLIUSDT",
};

const fmt = (n) => n >= 1
  ? Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })
  : Number(n).toFixed(5);

export default function ChartModal({ coin, onClose, interval = "240", onAddAlert }) {
  const containerRef = useRef(null);
  const symbol = SYMBOL_MAP[coin.id] ?? `BYBIT:${coin.symbol.toUpperCase()}USDT`;

  const [showAlertForm, setShowAlertForm] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const [condition,     setCondition]     = useState("above");
  const [price,         setPrice]         = useState(() => fmt(coin.current_price));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "100%";
    widgetDiv.style.width = "100%";
    container.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval,
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "#0f0f0f",
      gridColor: "#1a1a1a",
      allow_symbol_change: true,
      save_image: false,
      calendar: false,
      hide_top_toolbar: false,
      hide_side_toolbar: false,
      support_host: "https://www.tradingview.com",
    });
    container.appendChild(script);

    return () => { container.innerHTML = ""; };
  }, [symbol, interval]);

  function handleAddAlert(e) {
    e.preventDefault();
    if (!price) return;
    onAddAlert?.(coin.id, coin.name, coin.symbol, coin.image, condition, price);
    setShowAlertForm(false);
    setPrice(fmt(coin.current_price));
  }

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>

        {/* header */}
        <div style={S.header}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <img src={coin.image} alt={coin.symbol} style={{ width:24, height:24, borderRadius:"50%" }} />
            <span style={S.title}>{coin.name}</span>
            <span style={S.sym}>{coin.symbol.toUpperCase()}/USDT</span>
            <span style={{ fontSize:12, color:"#475569" }}>
              ${fmt(coin.current_price)}
            </span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button style={S.alertBtn} onClick={() => setShowAlertForm(v => !v)}>
              🔔 Set Alert
            </button>
            <button style={S.close} onClick={onClose}>✕</button>
          </div>
        </div>

        {/* inline alert form */}
        {showAlertForm && (
          <form onSubmit={handleAddAlert} style={S.alertForm}>
            <select style={S.input} value={condition} onChange={e => setCondition(e.target.value)}>
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
            <input
              style={{ ...S.input, width:160 }}
              type="number"
              step="any"
              value={price}
              onChange={e => setPrice(e.target.value)}
              autoFocus
            />
            <button style={S.addBtn} type="submit">+ Add</button>
            <button style={S.cancelBtn} type="button" onClick={() => setShowAlertForm(false)}>Cancel</button>
          </form>
        )}

        {/* chart */}
        <div
          ref={containerRef}
          className="tradingview-widget-container"
          style={{ flex:1, minHeight:0 }}
        />
      </div>
    </div>
  );
}

const S = {
  overlay: {
    position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:200,
    display:"flex", alignItems:"center", justifyContent:"center", padding:16,
  },
  modal: {
    width:"min(1100px, 100%)", height:"min(720px, 90dvh)",
    background:"#0f0f0f", borderRadius:14, border:"1px solid #1a1a1a",
    display:"flex", flexDirection:"column", overflow:"hidden",
  },
  header: {
    display:"flex", justifyContent:"space-between", alignItems:"center",
    padding:"12px 16px", borderBottom:"1px solid #1a1a1a", flexShrink:0,
  },
  title:    { fontSize:15, fontWeight:700, color:"#f1f5f9" },
  sym:      { fontSize:11, color:"#475569", marginLeft:4 },
  close:    { background:"none", border:"none", color:"#475569", fontSize:16, cursor:"pointer", padding:"4px 8px" },
  alertBtn: { background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:8, color:"#f1f5f9", padding:"5px 12px", fontSize:12, cursor:"pointer" },
  alertForm:{ display:"flex", alignItems:"center", gap:8, padding:"10px 16px", borderBottom:"1px solid #1a1a1a", background:"#0a0a0a", flexShrink:0 },
  input:    { background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:6, color:"#f1f5f9", padding:"6px 10px", fontSize:13, outline:"none" },
  addBtn:   { background:"#16a34a", border:"none", borderRadius:6, color:"#fff", padding:"6px 14px", fontSize:13, cursor:"pointer", fontWeight:600 },
  cancelBtn:{ background:"none", border:"none", color:"#475569", padding:"6px 8px", fontSize:13, cursor:"pointer" },
};
