import { useEffect, useRef } from "react";

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

export default function ChartModal({ coin, onClose }) {
  const containerRef = useRef(null);
  const symbol = SYMBOL_MAP[coin.id] ?? `BYBIT:${coin.symbol.toUpperCase()}USDT`;

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
      interval: "240",
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
  }, [symbol]);

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={S.header}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <img src={coin.image} alt={coin.symbol} style={{ width:24, height:24, borderRadius:"50%" }} />
            <span style={S.title}>{coin.name}</span>
            <span style={S.sym}>{coin.symbol.toUpperCase()}/USDT</span>
          </div>
          <button style={S.close} onClick={onClose}>✕</button>
        </div>
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
  title: { fontSize:15, fontWeight:700, color:"#f1f5f9" },
  sym:   { fontSize:11, color:"#475569", marginLeft:4 },
  close: { background:"none", border:"none", color:"#475569", fontSize:16, cursor:"pointer", padding:"4px 8px" },
};
