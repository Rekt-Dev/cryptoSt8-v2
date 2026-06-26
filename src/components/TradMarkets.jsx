import { useState, useEffect } from "react";
import ChartModal from "./ChartModal";

const INSTRUMENTS = [
  // Equities & Commodities
  { id: "NQ=F",  name: "Nasdaq 100",   sym: "NQ1!",   tv: "CME_MINI:NQ1!"  },
  { id: "ES=F",  name: "S&P 500 Mini", sym: "ES1!",   tv: "CME_MINI:ES1!"  },
  { id: "GC=F",  name: "Gold",         sym: "XAU",    tv: "COMEX:GC1!"     },
  { id: "CL=F",  name: "WTI Oil",      sym: "WTI",    tv: "NYMEX:CL1!"     },
  { id: "HG=F",  name: "Copper",       sym: "HG",     tv: "COMEX:HG1!"     },
  // Volatility & Dollar
  { id: "^VIX",  name: "VIX",          sym: "VIX",    tv: "CBOE:VIX"       },
  { id: "DX=F",  name: "DXY",          sym: "DXY",    tv: "TVC:DXY"        },
  // Bonds
  { id: "^TNX",  name: "US 10Y Yield", sym: "10Y",    tv: "TVC:US10Y"      },
  { id: "^IRX",  name: "US 2Y Yield",  sym: "2Y",     tv: "TVC:US02Y"      },
  { id: "^TYX",  name: "US 30Y Yield", sym: "30Y",    tv: "TVC:US30Y"      },
  { id: "^FVX",  name: "US 5Y Yield",  sym: "5Y",     tv: "TVC:US05Y"      },
  { id: "^GBX",  name: "Bund 10Y",     sym: "BUND",   tv: "TVC:DE10Y"      },
];

async function fetchTrad() {
  const results = await Promise.allSettled(
    INSTRUMENTS.map(ins =>
      fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ins.id}?interval=1d&range=2d`)
        .then(r => r.json())
        .then(d => {
          const q = d.chart?.result?.[0];
          if (!q) return null;
          const price  = q.meta.regularMarketPrice;
          const prev   = q.meta.previousClose ?? q.meta.chartPreviousClose;
          const change = prev ? ((price - prev) / prev) * 100 : 0;
          return { ...ins, price, change };
        })
    )
  );
  return results.map(r => r.status === "fulfilled" ? r.value : null).filter(Boolean);
}

const fmt = (n) => Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });

export default function TradMarkets({ interval }) {
  const [data,      setData]      = useState([]);
  const [chartCoin, setChartCoin] = useState(null);

  useEffect(() => {
    fetchTrad().then(setData);
    const iv = setInterval(() => fetchTrad().then(setData), 60_000);
    return () => clearInterval(iv);
  }, []);

  if (!data.length) return null;

  return (
    <>
      <div style={S.wrap}>
        <div style={S.header}>
          <span style={S.label}>Traditional Markets</span>
          <span style={S.sub}>scroll down? seriously?</span>
        </div>
        <div style={S.grid}>
          {data.map(c => {
            const up = c.change >= 0;
            return (
              <div key={c.id} style={S.card} onClick={() => setChartCoin(c)}>
                <div style={S.top}>
                  <div>
                    <div style={S.name}>{c.name}</div>
                    <div style={S.sym}>{c.sym}</div>
                  </div>
                  <div style={S.right}>
                    <div style={S.price}>${fmt(c.price)}</div>
                    <div style={{ ...S.chg, color: up ? "#4ade80" : "#f87171" }}>
                      {up ? "▲" : "▼"} {Math.abs(c.change).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {chartCoin && (
        <ChartModal
          coin={{ id: chartCoin.id, name: chartCoin.name, symbol: chartCoin.sym, image: "", current_price: chartCoin.price }}
          interval={interval}
          onClose={() => setChartCoin(null)}
          onAddAlert={null}
          symbolOverride={chartCoin.tv}
        />
      )}
    </>
  );
}

const S = {
  wrap:   { padding:"16px 20px", borderTop:"1px solid #1a1a1a" },
  header: { display:"flex", alignItems:"baseline", gap:12, marginBottom:12 },
  label:  { fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:"0.12em" },
  sub:    { fontSize:10, color:"#334155", fontStyle:"italic" },
  grid:   { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:10 },
  card:   { background:"#0f0f0f", border:"1px solid #1a1a1a", borderRadius:12, padding:"12px 14px", cursor:"pointer", transition:"border-color 0.15s" },
  top:    { display:"flex", justifyContent:"space-between", alignItems:"flex-start" },
  name:   { fontSize:13, fontWeight:600, color:"#f1f5f9" },
  sym:    { fontSize:10, color:"#475569", textTransform:"uppercase", marginTop:2 },
  right:  { textAlign:"right" },
  price:  { fontSize:14, fontWeight:700, color:"#f1f5f9" },
  chg:    { fontSize:11, fontWeight:600, marginTop:2 },
};
