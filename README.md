# cryptoSt8 v2

> A complete rebuild of [cryptoSt8 v1](https://github.com/Rekt-Dev/cryptoSite) — modernized stack, live CoinGecko data, dark mode first.

## 🚀 Live Demo

**[https://stirring-cactus-62412e.netlify.app](https://stirring-cactus-62412e.netlify.app)**

## Overview

Real-time crypto market dashboard pulling live data from CoinGecko's free API. No API keys, no CORS proxies. Auto-refreshes every 60 seconds.

## Features

| Feature | Details |
|---------|---------|
| 📡 Live ticker | Scrolling price strip — BTC, ETH, BNB, XRP, ADA, SOL, DOGE, DOT, MATIC, DAI |
| 🌍 Global stats | Total market cap, 24h volume, BTC/ETH dominance |
| 💹 Price cards | Per-coin cards with 7-day sparkline charts, 24h & 7d % change — click for full detail |
| 😨 Fear & Greed | Live index gauge — click for 30-day history and level breakdown |
| 🔥 Trending | Top 7 trending coins from CoinGecko |
| 🚀 Top Movers | Biggest gainers & losers |
| 🌙 Dark mode | Pure dark, built for night sessions |

## Tech Stack

| Layer | Tech |
|-------|------|
| UI | React 19 + Vite |
| Data | CoinGecko API (free, no key) + Alternative.me Fear & Greed |
| Charts | Custom SVG sparklines + 30-day price charts |
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
├── api.js                   # CoinGecko + Fear & Greed API calls
├── App.jsx                  # Layout + data orchestration
└── components/
    ├── Ticker.jsx            # Auto-scrolling price ticker
    ├── GlobalBar.jsx         # Market cap / dominance stats
    ├── PriceCards.jsx        # Coin cards with SVG sparklines
    ├── CoinModal.jsx         # Coin detail modal (30-day chart, stats, links)
    ├── FearGreed.jsx         # Fear & Greed gauge (SVG)
    ├── FearGreedModal.jsx    # F&G history modal (30-day bar chart)
    ├── Trending.jsx          # CoinGecko trending list
    └── TopMovers.jsx         # Top gainers & losers
```

---

*Built by [Rekt Dev](https://github.com/Rekt-Dev) · Invictus Crypto Strategies · AI-assisted rebuild of a handwritten v1*
