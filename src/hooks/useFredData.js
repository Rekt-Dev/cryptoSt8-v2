import { useState, useEffect } from "react";

const BASE = "/.netlify/functions/fred";

const SERIES = {
  // Interest Rates
  fed_funds:    { id: "FEDFUNDS",    label: "Fed Funds Rate",     unit: "%",  section: "rates" },
  sofr:         { id: "SOFR",        label: "SOFR",               unit: "%",  section: "rates" },
  // Inflation
  cpi_yoy:      { id: "CPIAUCSL",    label: "CPI YoY",            unit: "%",  section: "inflation", transform: "pch" },
  core_cpi_yoy: { id: "CPILFESL",    label: "Core CPI YoY",       unit: "%",  section: "inflation", transform: "pch" },
  pce_yoy:      { id: "PCEPI",       label: "PCE YoY",            unit: "%",  section: "inflation", transform: "pch" },
  core_pce_yoy: { id: "PCEPILFE",    label: "Core PCE YoY",       unit: "%",  section: "inflation", transform: "pch" },
  // Labor
  nfp:          { id: "PAYEMS",      label: "NFP",                unit: "K",  section: "labor", transform: "chg" },
  unemployment: { id: "UNRATE",      label: "Unemployment",       unit: "%",  section: "labor" },
  jobless:      { id: "ICSA",        label: "Jobless Claims",     unit: "K",  section: "labor" },
  // Housing
  housing_starts:{ id: "HOUST",      label: "Housing Starts",     unit: "K",  section: "housing" },
  existing_sales:{ id: "EXHOSLUSM495S", label: "Existing Sales",  unit: "K",  section: "housing" },
  // GDP
  gdp:          { id: "A191RL1Q225SBEA", label: "GDP QoQ",        unit: "%",  section: "gdp" },
};

async function fetchSeries(seriesId, transform) {
  const units = transform === "pch" ? "&units=pc1" : transform === "chg" ? "&units=chg" : "";
  const r = await fetch(`${BASE}?series_id=${seriesId}${units ? `&units=${units.replace("&units=","")}` : ""}`);
  const d = await r.json();
  const obs = d.observations?.filter(o => o.value !== ".") ?? [];
  if (!obs.length) return null;
  const latest = parseFloat(obs[0].value);
  const prev   = obs[1] ? parseFloat(obs[1].value) : null;
  return { value: latest, prev, date: obs[0].date };
}

export function useFredData() {
  const [data, setData] = useState({});

  useEffect(() => {
    async function load() {
      const results = await Promise.allSettled(
        Object.entries(SERIES).map(async ([key, s]) => {
          const r = await fetchSeries(s.id, s.transform);
          return [key, r ? { ...s, ...r } : null];
        })
      );
      const next = {};
      results.forEach(r => {
        if (r.status === "fulfilled" && r.value[1]) {
          next[r.value[0]] = r.value[1];
        }
      });
      setData(next);
    }
    load();
    // FRED data is released monthly/quarterly — refresh every 6h
    const iv = setInterval(load, 6 * 60 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  return data;
}

export const SECTION_LABELS = {
  rates:     "Interest Rates",
  inflation: "Inflation",
  labor:     "Labor",
  housing:   "Housing",
  gdp:       "GDP",
};
