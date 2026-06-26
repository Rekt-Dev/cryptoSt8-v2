const BASE = "https://api.coingecko.com/api/v3";
const KEY  = "CG-1ZCUrv6ELEPtJfiewxFZtfdf";
const qs   = `x_cg_demo_api_key=${KEY}`;

export const COINS = [
  // blue chips / majors
  "bitcoin", "ethereum", "solana", "binancecoin", "ripple", "cardano",
  "bitcoin-cash", "avalanche-2", "near", "algorand", "litecoin",
  // DeFi / infra
  "aave", "curve-dao-token", "lido-dao", "uniswap", "chainlink",
  "ondo-finance", "pyth-network", "ethena", "jupiter-ag", "filecoin",
  // L2 / ecosystem
  "arbitrum", "optimism", "mantle", "blockstack", "celestia",
  "aptos", "sui", "injective-protocol", "astar", "hyperliquid",
  // perp / trading
  "dydx", "worldcoin-wld", "falcon-finance",
  // other
  "monero", "zcash", "apecoin", "enjincoin", "tron", "plasma",
  // memes (clumped)
  "dogecoin", "shiba-inu", "pepe", "dogwifcoin", "floki", "official-trump",
  "chill-guy", "fartcoin", "gigachad", "spx6900",
  "pudgy-penguins", "useless", "broccoli-714",
];

export async function fetchMarkets() {
  const r = await fetch(
    `${BASE}/coins/markets?vs_currency=usd&ids=${COINS.join(",")}&order=market_cap_desc&sparkline=true&price_change_percentage=24h,7d&${qs}`
  );
  return r.json();
}

export async function fetchTrending() {
  const r = await fetch(`${BASE}/search/trending?${qs}`);
  const d = await r.json();
  return d.coins?.map(c => c.item) ?? [];
}

export async function fetchGlobal() {
  const r = await fetch(`${BASE}/global?${qs}`);
  const d = await r.json();
  return d.data;
}

export async function fetchFearGreed() {
  const r = await fetch("https://api.alternative.me/fng/?limit=1");
  const d = await r.json();
  return d.data?.[0];
}

export async function fetchCoinDetail(id) {
  const [detail, chart] = await Promise.all([
    fetch(`${BASE}/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false&${qs}`).then(r => r.json()),
    fetch(`${BASE}/coins/${id}/market_chart?vs_currency=usd&days=30&${qs}`).then(r => r.json()),
  ]);
  return { detail, chart };
}

export async function fetchFearGreedHistory() {
  const r = await fetch("https://api.alternative.me/fng/?limit=30&format=json");
  const d = await r.json();
  return (d.data ?? []).reverse();
}
