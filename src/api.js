const BASE = "https://api.coingecko.com/api/v3";
const KEY  = "CG-1ZCUrv6ELEPtJfiewxFZtfdf";
const qs   = `x_cg_demo_api_key=${KEY}`;

export const COINS = ["bitcoin","ethereum","binancecoin","ripple","cardano","solana","dogecoin","polkadot","matic-network","dai"];

export async function fetchPrices() {
  const ids = COINS.join(",");
  const r = await fetch(`${BASE}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&${qs}`);
  return r.json();
}

export async function fetchMarkets() {
  const r = await fetch(`${BASE}/coins/markets?vs_currency=usd&ids=${COINS.join(",")}&order=market_cap_desc&sparkline=true&price_change_percentage=24h,7d&${qs}`);
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
