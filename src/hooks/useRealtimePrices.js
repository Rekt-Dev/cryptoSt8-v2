import { useEffect, useRef, useCallback } from "react";

// CoinGecko ID → Binance stream symbol (lowercase)
const BINANCE_MAP = {
  "bitcoin":           "btcusdt",
  "ethereum":          "ethusdt",
  "solana":            "solusdt",
  "binancecoin":       "bnbusdt",
  "ripple":            "xrpusdt",
  "cardano":           "adausdt",
  "bitcoin-cash":      "bchusdt",
  "avalanche-2":       "avaxusdt",
  "near":              "nearusdt",
  "algorand":          "algousdt",
  "litecoin":          "ltcusdt",
  "aave":              "aaveusdt",
  "curve-dao-token":   "crvusdt",
  "lido-dao":          "ldousdt",
  "uniswap":           "uniusdt",
  "chainlink":         "linkusdt",
  "ondo-finance":      "ondousdt",
  "pyth-network":      "pythusdt",
  "ethena":            "enausdt",
  "jupiter-ag":        "jupusdt",
  "filecoin":          "filusdt",
  "arbitrum":          "arbusdt",
  "optimism":          "opusdt",
  "mantle":            "mntusdt",
  "blockstack":        "stxusdt",
  "celestia":          "tiausdt",
  "aptos":             "aptusdt",
  "sui":               "suiusdt",
  "injective-protocol":"injusdt",
  "astar":             "astrusdt",
  "hyperliquid":       "hypeusdt",
  "dydx":              "dydxusdt",
  "worldcoin-wld":     "wldusdt",
  "monero":            "xmrusdt",
  "zcash":             "zecusdt",
  "apecoin":           "apeusdt",
  "enjincoin":         "enjusdt",
  "tron":              "trxusdt",
  "dogecoin":          "dogeusdt",
  "shiba-inu":         "shibusdt",
  "pepe":              "pepeusdt",
  "dogwifcoin":        "wifusdt",
  "floki":             "flokiusdt",
  "official-trump":    "trumpusdt",
  "pudgy-penguins":    "penguusdt",
};

// reverse: binance symbol → coingecko id
const SYMBOL_TO_ID = Object.fromEntries(
  Object.entries(BINANCE_MAP).map(([id, sym]) => [sym, id])
);

const streams = Object.values(BINANCE_MAP).map(s => `${s}@miniTicker`).join("/");
const WS_URL  = `wss://stream.binance.com:9443/stream?streams=${streams}`;

export function useRealtimePrices(setMarkets) {
  const wsRef      = useRef(null);
  const retryTimer = useRef(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const { data } = JSON.parse(e.data);
        // data.s = "BTCUSDT", data.c = current close price
        const coinId = SYMBOL_TO_ID[data.s?.toLowerCase()];
        if (!coinId) return;
        const newPrice = parseFloat(data.c);
        if (!newPrice) return;

        setMarkets(prev => {
          const idx = prev.findIndex(c => c.id === coinId);
          if (idx === -1) return prev;
          const coin = prev[idx];
          if (coin.current_price === newPrice) return prev;

          // recalculate 24h % from open price
          const open = parseFloat(data.o);
          const newChange = open > 0 ? ((newPrice - open) / open) * 100 : coin.price_change_percentage_24h;

          const next = [...prev];
          next[idx] = { ...coin, current_price: newPrice, price_change_percentage_24h: newChange };
          return next;
        });
      } catch {}
    };

    ws.onclose = () => {
      retryTimer.current = setTimeout(connect, 3000);
    };
    ws.onerror = () => ws.close();
  }, [setMarkets]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(retryTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);
}
