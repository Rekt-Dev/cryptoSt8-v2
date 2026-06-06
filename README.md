# cryptoSt8 v2

> A complete rebuild of [cryptoSt8 v1](https://github.com/Rekt-Dev/cryptoSite) — modernized stack, live CoinGecko data, dark mode first.

## Overview

Real-time crypto market dashboard pulling live data from CoinGecko's free API. No API keys, no CORS proxies. Auto-refreshes every 60 seconds.

## Features

| Feature | Details |
|---------|---------|
| 📡 Live ticker | Scrolling price strip — BTC, ETH, BNB, XRP, ADA, SOL, DOGE, DOT, MATIC, DAI |
| 🌍 Global stats | Total market cap, 24h volume, BTC/ETH dominance |
| 💹 Price cards | Per-coin cards with 7-day sparkline charts, 24h & 7d % change |
| 😨 Fear & Greed | Live index gauge with color-coded needle |
| 🔥 Trending | Top 7 trending coins from CoinGecko |
| 🚀 Top Movers | Biggest gainers & losers |
| 🌙 Dark mode | Pure dark, built for night sessions |

## Tech Stack

| Layer | Tech |
|-------|------|
| UI | React 18 + Vite |
| Data | CoinGecko API (free, no key) + Alternative.me Fear & Greed |
| Charts | Custom SVG sparklines |
| Styling | Inline styles, zero CSS frameworks |
| Deploy | Netlify |

## v1 → v2

| | v1 | v2 |
|--|----|----|
| Build tool | Create React App | Vite |
| Data source | CoinRanking + Messari (broken CORS proxy) | CoinGecko (no CORS needed) |
| Components | Mostly placeholder stubs | All real, all live data |
| Design | Rough draft | Dark mode dashboard |
| AI assisted | ❌ 100% handwritten | ✅ Rebuilt with AI assistance |

## Run Locally

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── api.js                # CoinGecko + Fear & Greed API calls
├── App.jsx               # Layout + data orchestration
└── components/
    ├── Ticker.jsx         # Auto-scrolling price ticker
    ├── GlobalBar.jsx      # Market cap / dominance stats
    ├── PriceCards.jsx     # Coin cards with SVG sparklines
    ├── FearGreed.jsx      # Fear & Greed gauge (SVG)
    ├── Trending.jsx       # CoinGecko trending list
    └── TopMovers.jsx      # Top gainers & losers
```

---

*Built by [Rekt Dev](https://github.com/Rekt-Dev) · AI-assisted rebuild of a handwritten v1*
