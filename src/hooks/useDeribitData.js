import { useState, useEffect } from "react";

const API = "https://www.deribit.com/api/v2/public";

async function getDvol(currency) {
  const now   = Date.now();
  const start = now - 2 * 3600 * 1000;
  const r = await fetch(`${API}/get_volatility_index_data?currency=${currency}&resolution=3600&start_timestamp=${start}&end_timestamp=${now}`);
  const d = await r.json();
  const data = d.result?.data ?? [];
  if (data.length < 2) return null;
  const current = data[data.length - 1][4]; // close
  const prev    = data[data.length - 2][4];
  return { value: current, change: current - prev };
}

async function getSpotPrice(currency) {
  const r = await fetch(`${API}/get_index_price?index_name=${currency.toLowerCase()}_usd`);
  const d = await r.json();
  return d.result?.index_price ?? null;
}

async function getOptionsData(currency) {
  // get all active options
  const r = await fetch(`${API}/get_instruments?currency=${currency}&kind=option&expired=false`);
  const d = await r.json();
  const instruments = d.result ?? [];

  const spot = await getSpotPrice(currency);
  if (!spot) return null;

  // find nearest 3 expiries (weekly, monthly, quarterly)
  const now = Date.now();
  const expiries = [...new Set(instruments.map(i => i.expiration_timestamp))]
    .filter(t => t > now + 3600_000) // at least 1h away
    .sort((a, b) => a - b)
    .slice(0, 3);

  const results = await Promise.allSettled(expiries.map(async (exp) => {
    const expStr = new Date(exp).toISOString().split("T")[0].replace(/-/g, "").slice(2); // YYMMDD
    const label  = formatExpiry(exp);
    const daysToExp = (exp - now) / 86_400_000;

    // get strikes near ATM (within 10%)
    const strikes = instruments
      .filter(i => i.expiration_timestamp === exp)
      .map(i => i.strike)
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => Math.abs(a - spot) - Math.abs(b - spot))
      .slice(0, 6);

    if (!strikes.length) return null;

    // fetch book summaries for ATM call + put at nearest strike
    const atmStrike = strikes[0];
    const [callRes, putRes] = await Promise.all([
      fetch(`${API}/get_order_book?instrument_name=${currency}-${formatDeribitDate(exp)}-${atmStrike}-C&depth=1`).then(r => r.json()),
      fetch(`${API}/get_order_book?instrument_name=${currency}-${formatDeribitDate(exp)}-${atmStrike}-P&depth=1`).then(r => r.json()),
    ]);

    const callIv = callRes.result?.mark_iv ?? null;
    const putIv  = putRes.result?.mark_iv  ?? null;
    const atmIv  = callIv != null ? callIv : putIv;
    const skew   = (callIv != null && putIv != null) ? callIv - putIv : null;

    return { label, daysToExp: Math.round(daysToExp), atmIv, skew, strike: atmStrike };
  }));

  return results.map(r => r.status === "fulfilled" ? r.value : null).filter(Boolean);
}

function formatDeribitDate(ts) {
  const d = new Date(ts);
  const day   = String(d.getUTCDate()).padStart(2, "0");
  const month = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"][d.getUTCMonth()];
  const year  = String(d.getUTCFullYear()).slice(2);
  return `${day}${month}${year}`;
}

function formatExpiry(ts) {
  const d = new Date(ts);
  const day   = String(d.getUTCDate()).padStart(2, "0");
  const month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getUTCMonth()];
  return `${day} ${month}`;
}

export function useDeribitData() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [btcDvol, ethDvol, btcOptions, ethOptions] = await Promise.all([
          getDvol("BTC"),
          getDvol("ETH"),
          getOptionsData("BTC"),
          getOptionsData("ETH"),
        ]);
        setData({ btcDvol, ethDvol, btcOptions, ethOptions });
      } catch (e) {
        console.error("Deribit fetch error", e);
      }
    }
    load();
    const iv = setInterval(load, 60_000);
    return () => clearInterval(iv);
  }, []);

  return data;
}
