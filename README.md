# 🪙 Crypto-View — Real-Time Cryptocurrency Market Dashboard

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![WebSocket](https://img.shields.io/badge/WebSocket-Live_Streaming-FF6600?style=for-the-badge&logo=websocket&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://crypto-view-usvc.vercel.app/)

> A modern, high-performance, full-stack cryptocurrency intelligence platform delivering live price tickers, interactive historical charts, market sentiment, and portfolio tracking — powered by native WebSockets and smart caching.

## 🚀 Live Demo

**[https://crypto-view-usvc.vercel.app/](https://crypto-view-usvc.vercel.app/)**

---

## 📖 Table of Contents

- [About The Project](#-about-the-project)
- [Why I Built This Project](#-why-i-built-this-project)
- [✨ What Makes It Interesting?](#-what-makes-it-interesting)
- [🚀 Key Features](#-key-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ System Architecture](#️-system-architecture)
- [⚡ Quick Start & Installation](#-quick-start--installation)
  - [Prerequisites](#prerequisites)
  - [Installation](#1-clone--install-dependencies)
  - [Environment Configuration](#2-configure-environment-variables)
  - [Running the Application](#3-run-the-application)
- [📜 Available Scripts](#-available-scripts)
- [📡 API & WebSocket Reference](#-api--websocket-reference)
- [📂 Project Structure](#-project-structure)
- [📄 License](#-license)

---

## 🌟 About The Project

**Crypto-View** is an end-to-end cryptocurrency tracking platform built from the ground up to solve the latency, clunkiness, and ad-heavy experience common to mainstream crypto trackers.

Instead of relying on slow page refreshes or periodic polling, **Crypto-View** combines a fast **React 19 + TypeScript** frontend with an **Express.js + WebSocket** backend that streams real-time trade ticks directly from global exchanges. Paired with interactive **Recharts** visualizations, a persistent watchlist, and comprehensive market intelligence (Bitcoin dominance, Fear & Greed sentiment, 24h gainers/losers), it delivers a sleek, professional "Bloomberg-lite" experience for crypto enthusiasts and developers alike.

---

## 💡 Why I Built This Project

Financial markets move at sub-second speeds, yet many web dashboards still treat market data like static blog posts — requiring manual reloads or battering rate-limited third-party endpoints.

I created **Crypto-View** to:
1. **Master Real-Time Event Architecture**: Build a production-grade, full-duplex WebSocket pipeline that ingests high-frequency exchange ticks, aggregates them server-side, and broadcasts clean updates to connected browser clients with zero UI freeze.
2. **Solve Real-World API Rate Limiting**: Work with public crypto market APIs (such as CoinGecko) without hitting strict 429 rate limits, by designing an in-memory TTL caching shield (`NodeCache`) with stale-while-revalidate fallbacks.
3. **Deliver a Premium User Experience**: Build a dark-mode first, responsive UI with fluid micro-interactions, live price-flash indicators (green for up, red for down), and clean data hierarchy rather than a cookie-cutter template.
4. **Practice Clean Full-Stack Engineering**: Maintain strict TypeScript contracts across both frontend and backend, abstracting data providers behind service interfaces so third-party APIs can be swapped without touching frontend logic.

---

## ✨ What Makes It Interesting?

- ⚡ **Sub-Second Live Price Flashes**: Price badges highlight green or red in real time as WebSocket trade ticks arrive, mimicking professional trading terminals.
- 🛡️ **Intelligent Caching Shield**: Multi-tier in-memory caching protects third-party APIs while providing near-instant responses (<10ms) for repeated queries.
- 📊 **Responsive High-Resolution Charts**: Historical market data is dynamically rendered using Recharts with multi-timeframe toggles (24H, 7D, 30D, 90D, 1Y) and crosshair tooltips.
- 🔄 **Automatic Provider Fallbacks & Reconnection**: The backend gracefully handles WebSocket reconnects with exponential backoff and maintains market snapshots for newly joined clients.
- 💾 **Instant Browser Watchlist**: Bookmark any coin with zero authentication required; your watchlist is persisted client-side and automatically synchronized with live price streams.
- 🌐 **Clean Reverse Proxy Setup**: Vite proxies both REST (`/api`) and WebSocket (`/ws`) requests during development, avoiding CORS complications and simulating production setups.

---

## 🚀 Key Features

| Feature | Description |
| :--- | :--- |
| **Global Market Metrics** | Total market cap, 24h trading volume, BTC dominance, ETH dominance, and active crypto count. |
| **Live Markets Explorer** | Filterable, searchable, and sortable table with 24h change, high/low spread, volume, and market cap rank. |
| **Interactive Price Charts** | Area charts for 24h, 7-day, 30-day, 90-day, and 1-year historical price and volume trends. |
| **Coin Deep-Dive Pages** | Detailed statistics: All-Time High/Low (ATH/ATL), circulating vs total supply, rank, and official links. |
| **Top Gainers & Losers** | Curated widgets highlighting the day's top performing and underperforming assets. |
| **Trending Cryptocurrencies** | Live trending coins spotlight powered by current market search momentum. |
| **Custom Watchlist** | Add or remove coins to a personalized tracking list with instant localStorage persistence. |
| **Global Instant Search** | Quick modal search across hundreds of tokens by name or symbol with keyboard navigation. |

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 (Hooks, Context, Functional Components)
- **Build Tool:** Vite 6
- **Language:** TypeScript 5.7
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **Icons:** Lucide React
- **Routing:** React Router DOM v7

### Backend
- **Runtime:** Node.js (v18+)
- **Server:** Express.js 4.21
- **Live Stream:** `ws` (Native WebSocket Server)
- **Language & Execution:** TypeScript with `tsx` (Hot-reloading development)
- **Caching:** `node-cache` (In-memory TTL)
- **HTTP Client:** Axios
- **Rate Limiting:** `express-rate-limit`

---

## 🏗️ System Architecture

```text
  ┌─────────────────────────────────────────────────────────┐
  │                 Public Market Providers                 │
  │               (CoinGecko REST / Binance WS)             │
  └────────────────────────────┬────────────────────────────┘
                               │
                               ▼
  ┌─────────────────────────────────────────────────────────┐
  │                   Express.js Backend                    │
  │  ┌───────────────────────┐   ┌───────────────────────┐  │
  │  │   In-Memory Cache     │   │   WebSocket Service   │  │
  │  │     (NodeCache)       │   │    (Tick Broadcast)   │  │
  │  └───────────────────────┘   └───────────────────────┘  │
  │             ▲                             ▲             │
  │             │ /api/*                      │ /ws         │
  └─────────────┼─────────────────────────────┼─────────────┘
                │                             │
                ▼                             ▼
  ┌─────────────────────────────────────────────────────────┐
  │                   React 19 Frontend                     │
  │  ┌───────────────────────┐   ┌───────────────────────┐  │
  │  │ Recharts Visuals      │   │ Real-Time Live Ticker │  │
  │  └───────────────────────┘   └───────────────────────┘  │
  │  ┌───────────────────────┐   ┌───────────────────────┐  │
  │  │ Local Watchlist Store │   │ Dark Theme UI         │  │
  │  └───────────────────────┘   └───────────────────────┘  │
  └─────────────────────────────────────────────────────────┘
```

---

## ⚡ Quick Start & Installation

Follow these steps to get the full-stack application running on your local machine.

### Prerequisites

Ensure you have the following installed:
- **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **npm**: `v9.0.0` or higher (packaged with Node.js)
- **Git**: [Download Git](https://git-scm.com/)

---

### 1. Clone & Install Dependencies

Clone the repository to your local machine:

```bash
git clone https://github.com/SNSAIKRISHNA/Crypto-View.git
cd Crypto-View
```

Install root, backend, and frontend dependencies in one command:

```bash
npm install
npm run install:all
```

*(Alternatively, you can install each directory manually: `cd backend && npm install`, then `cd ../frontend && npm install`)*

---

### 2. Configure Environment Variables

#### Backend Configuration:
Create a `.env` file inside the `backend/` folder (or copy from `.env.example`):

```bash
# In backend/.env
PORT=5000
FRONTEND_URL=http://localhost:5173
COINGECKO_API_KEY=
CACHE_TTL_MARKETS=60
CACHE_TTL_GLOBAL=120
CACHE_TTL_COIN_DETAIL=300
CACHE_TTL_HISTORY=300
```
> **Note:** A CoinGecko API key is **optional**. The app will work out of the box using public endpoints!

#### Frontend Configuration:
Create a `.env` file inside the `frontend/` folder:

```bash
# In frontend/.env
VITE_API_BASE_URL=/api
VITE_WS_URL=ws://localhost:5000/ws
```

---

### 3. Run the Application

#### Option A: Run Both Together (Recommended)
From the root directory, run:

```bash
npm run dev
```
This launches **both** the backend (port `5000`) and the Vite frontend (port `5173`) concurrently in a single terminal.

#### Option B: Run Services in Separate Terminals
If you prefer dedicated terminal windows for backend and frontend logs:

**Terminal 1 (Backend):**
```bash
npm run dev:backend
```

**Terminal 2 (Frontend):**
```bash
npm run dev:frontend
```

---

### 4. View in Browser

Open your browser and navigate to:
```text
http://localhost:5173
```

- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000/api/markets](http://localhost:5000/api/markets)
- **Health Check:** [http://localhost:5000/health](http://localhost:5000/health)
- **WebSocket Feed:** `ws://localhost:5000/ws`

---

## 📜 Available Scripts

Run these scripts from the root `Crypto-View/` directory:

| Command | Description |
| :--- | :--- |
| `npm run install:all` | Installs dependencies across both `backend` and `frontend` |
| `npm run dev` | Runs backend and frontend concurrently in development mode |
| `npm run dev:backend` | Starts only the Express + WebSocket backend with hot reloading (`tsx watch`) |
| `npm run dev:frontend` | Starts only the Vite React frontend dev server |
| `npm run build` | Builds production bundles for both backend (`dist/`) and frontend (`dist/`) |
| `npm run start` | Runs the compiled backend server in production mode |

---

## 📡 API & WebSocket Reference

### REST Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Server status, uptime, and connected WebSocket clients |
| `GET` | `/api/markets` | Paginated cryptocurrency list with prices, market cap, and 24h change |
| `GET` | `/api/markets/global` | Global stats (total market cap, volume, BTC/ETH dominance) |
| `GET` | `/api/markets/trending` | Top 7 trending cryptocurrencies |
| `GET` | `/api/markets/gainers` | Top 24h percentage gainers |
| `GET` | `/api/markets/losers` | Top 24h percentage losers |
| `GET` | `/api/coin/:id` | Full token details, supply metrics, and ATH/ATL data |
| `GET` | `/api/coin/:id/history?days=7` | Historical price and volume data points for charts |
| `GET` | `/api/search?q=:query` | Autocomplete search across crypto symbols and names |

### WebSocket Protocol

Connect to the live stream at:
```text
ws://localhost:5000/ws
```

#### Welcome Packet (Initial Snapshot)
```json
{
  "type": "INITIAL_STATE",
  "status": "LIVE",
  "timestamp": 1718000000000,
  "data": [
    {
      "id": "bitcoin",
      "symbol": "BTC",
      "price": 67420.50,
      "change24h": 3.42,
      "timestamp": 1718000000000
    }
  ]
}
```

#### Real-Time Trade Tick
```json
{
  "type": "PRICE_UPDATE",
  "data": {
    "id": "bitcoin",
    "symbol": "BTC",
    "price": 67455.10,
    "change24h": 3.48,
    "timestamp": 1718000001250
  }
}
```

---

## 📂 Project Structure

```text
Crypto-View/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment variables & constants
│   │   ├── controllers/     # Route handlers (Market, Coin, Search)
│   │   ├── middleware/      # Rate limiter, error handling
│   │   ├── routes/          # Express route definitions
│   │   ├── services/
│   │   │   └── crypto/      # Crypto data provider, caching, & WebSocket service
│   │   ├── types/           # Backend TypeScript interfaces
│   │   └── server.ts        # Express & WebSocket HTTP server bootstrap
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Modular UI components (Dashboard, Coin, Layout, etc.)
│   │   ├── pages/           # Route views (HomePage, MarketsPage, CoinDetailPage, WatchlistPage)
│   │   ├── services/        # Axios API client & WebSocket subscription manager
│   │   ├── store/           # Watchlist and state persistence
│   │   ├── types/           # Frontend TypeScript types
│   │   ├── utils/           # Formatters (currency, percentage, dates)
│   │   ├── App.tsx          # Main application & routing
│   │   └── main.tsx         # React root
│   ├── .env
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── package.json             # Root orchestrator (concurrent dev scripts)
└── README.md
```
<img width="1901" height="983" alt="image" src="https://github.com/user-attachments/assets/e9909ae2-c8e6-4e91-9426-af1c7b391627" />
<img width="1899" height="990" alt="image" src="https://github.com/user-attachments/assets/59b67e31-6c55-4493-9d1e-bad30bb0e414" />
<img width="1905" height="985" alt="image" src="https://github.com/user-attachments/assets/69334995-ac9e-4bdd-9a85-760d407f75d4" />
<img width="1905" height="990" alt="image" src="https://github.com/user-attachments/assets/335b3dfb-c0d4-49a5-b6f1-f40d261a8b30" />
<img width="1903" height="982" alt="image" src="https://github.com/user-attachments/assets/c16d0532-994a-44d0-9be2-47b9abbd2eb5" />

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
