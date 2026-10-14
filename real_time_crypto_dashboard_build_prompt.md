# Real-Time Crypto Dashboard — Website Build Prompt

## Project Goal

Build a modern, responsive **real-time cryptocurrency dashboard** that allows users to monitor crypto prices, market statistics, price charts, market trends, and individual coin details.

The website should feel like a professional crypto tracking platform rather than a simple API demo.

The application must be:
- Fast and responsive
- Mobile, tablet, and desktop friendly
- Clean and modern
- Real-time where the data source supports it
- Easy to maintain and extend
- Secure with API keys kept on the server
- Production-ready

---

# 1. Recommended Tech Stack

Use the following stack unless there is a strong technical reason to change it:

### Frontend
- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Recharts or another high-quality charting library
- Lucide React for icons

### Backend
- Node.js
- Express.js
- TypeScript
- REST API endpoints
- WebSocket support where appropriate

### Data
Use a reliable cryptocurrency market-data provider.

Preferred architecture:

```text
Crypto Data Provider
        ↓
Backend/API Layer
        ↓
Frontend
```

Do not expose private API keys in frontend code.

If a provider offers WebSocket streaming, use WebSockets for live prices instead of repeatedly polling the API.

The data provider should be abstracted behind a service layer so it can be replaced later without rewriting the frontend.

Example:

```text
src/
  services/
    crypto/
      cryptoProvider.ts
      marketService.ts
      websocketService.ts
```

---

# 2. Main Pages

Create the following pages.

## Home / Dashboard

Route:

```text
/
```

Display:

- Total crypto market overview
- Global market cap
- 24h market-cap change
- 24h trading volume
- BTC dominance
- Trending cryptocurrencies
- Top cryptocurrencies
- Biggest gainers
- Biggest losers
- Recently viewed coins
- User watchlist
- Market overview chart

Create a strong dashboard layout with cards and tables.

---

# 3. Cryptocurrency List

Route:

```text
/markets
```

Display a searchable and sortable crypto table.

Columns:

| Column | Description |
|---|---|
| Rank | Market-cap ranking |
| Coin | Logo, name and symbol |
| Price | Current price |
| 1h | 1-hour percentage change |
| 24h | 24-hour percentage change |
| 7d | 7-day percentage change |
| Market Cap | Current market capitalization |
| Volume | 24-hour trading volume |
| Circulating Supply | Current circulating supply |
| Sparkline | Small 7-day chart |

Features:

- Search by coin name or symbol
- Sort by any major column
- Pagination or infinite scrolling
- Filter by gainers/losers
- Currency selector
- Refresh data
- Loading skeletons
- Empty states
- Error states

---

# 4. Individual Coin Page

Route:

```text
/coin/:id
```

Example:

```text
/coin/bitcoin
```

Display:

### Header

- Coin logo
- Coin name
- Symbol
- Rank
- Current price
- 24h percentage change

### Statistics

- Market cap
- Fully diluted valuation
- 24h volume
- Circulating supply
- Total supply
- Maximum supply
- All-time high
- All-time low

### Price Chart

Provide selectable time periods:

```text
1H
24H
7D
30D
90D
1Y
ALL
```

The chart should support:

- Responsive resizing
- Tooltips
- Price/date information
- Zoom where practical
- Smooth updates
- Positive/negative trend indication

### Additional Information

Include:

- About the cryptocurrency
- Official website
- Blockchain/explorer links
- Relevant community links when available
- Contract addresses where applicable

Do not invent missing data.

---

# 5. Real-Time Price Updates

This is one of the most important requirements.

Prices shown on the dashboard should update automatically.

Preferred approach:

```text
WebSocket
   ↓
Backend
   ↓
Frontend WebSocket
   ↓
React state/store
   ↓
UI
```

Avoid unnecessarily requesting the entire market list every second.

Use efficient updates such as:

```text
BTC price changes
      ↓
Only BTC-related UI state updates
```

Do not cause the entire application to re-render for every price tick.

Show a small live indicator:

```text
● LIVE
```

The indicator should clearly communicate whether the application is receiving live data.

If the WebSocket connection is lost:

```text
● RECONNECTING
```

After recovery:

```text
● LIVE
```

Implement automatic reconnection with exponential backoff.

---

# 6. Watchlist

Allow users to add and remove cryptocurrencies from a watchlist.

Example:

```text
♡ Bitcoin
♡ Ethereum
♡ Solana
```

Create:

```text
/watchlist
```

For an MVP, the watchlist can use localStorage.

Structure the code so authentication/database persistence can be added later.

Watchlist cards should show:

- Coin
- Current price
- 24h change
- Mini chart
- Remove button

---

# 7. Search

Create a global crypto search.

Users should be able to search:

```text
Bitcoin
BTC
Ethereum
ETH
Solana
SOL
```

Show search results as:

```text
Bitcoin
BTC
$XX,XXX
```

Add keyboard-friendly navigation if practical.

Search should be debounced to avoid excessive API requests.

---

# 8. Trending Section

Create a trending cryptocurrencies section.

Display:

- Coin logo
- Name
- Symbol
- Current price
- 24h change
- Rank

Make it visually distinct from the main market table.

---

# 9. Gainers and Losers

Create two sections:

### Top Gainers

Show cryptocurrencies with the largest positive percentage changes.

### Top Losers

Show cryptocurrencies with the largest negative percentage changes.

Each item should contain:

- Coin
- Symbol
- Price
- 24h percentage
- Mini trend indicator

---

# 10. Market Overview

Create a market summary section.

Example cards:

```text
Total Market Cap
$X.XXT
+X.XX%

24h Volume
$XX.XXB
-XX.XX%

BTC Dominance
XX.XX%

ETH Dominance
XX.XX%
```

The cards should update automatically when fresh data arrives.

---

# 11. Currency Support

Allow users to change the display currency.

Initially support:

```text
USD
INR
EUR
GBP
```

Design the application so additional currencies can be added later.

Default currency:

```text
USD
```

Optionally detect the user's locale without making location a requirement.

---

# 12. Theme

Implement:

- Dark mode
- Light mode

Default to dark mode because this is a crypto/market dashboard.

Use a professional visual hierarchy.

Avoid excessive gradients, excessive animations, and unnecessary visual effects.

---

# 13. UI Design

Design inspiration:

- Professional trading dashboards
- Modern financial applications
- Crypto portfolio platforms

The interface should be:

- Minimal
- Premium
- Data-focused
- Easy to scan
- Responsive

Use:

- Rounded cards
- Subtle borders
- Clear typography
- Good spacing
- Small status indicators
- Consistent icons
- Responsive tables
- Skeleton loading states

Do NOT make it look like a generic template.

---

# 14. Responsive Design

The website must work properly on:

```text
Mobile
Tablet
Laptop
Desktop
Large desktop
```

On mobile:

- Convert large tables into cards or horizontally scrollable sections
- Keep important price/change information visible
- Make charts responsive
- Use a mobile navigation menu
- Ensure buttons have comfortable touch targets

---

# 15. Backend API Architecture

Create a backend abstraction layer.

Example:

```text
backend/
  src/
    controllers/
      marketController.ts
      coinController.ts
      searchController.ts

    services/
      crypto/
        cryptoProvider.ts
        marketService.ts
        coinService.ts
        websocketService.ts

    routes/
      marketRoutes.ts
      coinRoutes.ts
      searchRoutes.ts

    middleware/
      errorHandler.ts
      rateLimiter.ts

    config/
      env.ts

    server.ts
```

Example endpoints:

```text
GET /api/markets
GET /api/markets/trending
GET /api/markets/gainers
GET /api/markets/losers
GET /api/coin/:id
GET /api/coin/:id/history
GET /api/search?q=bitcoin
GET /api/global
```

Use proper HTTP status codes.

---

# 16. API Security

Never place secret API keys inside:

```text
VITE_*
```

frontend environment variables if those keys are supposed to remain private.

Use backend environment variables:

```text
CRYPTO_API_KEY=your_key
```

Create:

```text
.env
.env.example
```

Never commit `.env`.

Add `.env` to `.gitignore`.

---

# 17. Caching

Avoid repeatedly requesting the same information.

Implement sensible caching for data that does not need millisecond-level updates.

For example:

```text
Global market data → cache briefly
Coin metadata → cache longer
Historical data → cache
Live price → WebSocket
```

This reduces API usage and improves performance.

---

# 18. Rate Limit Protection

The application must gracefully handle API rate limits.

If the provider responds with a rate-limit error:

- Do not continuously retry immediately
- Use backoff
- Show a user-friendly message
- Preserve previously loaded data where possible

Example:

```text
Market data temporarily unavailable.
Showing the latest available information.
```

---

# 19. Error Handling

Handle:

- API timeout
- API unavailable
- WebSocket disconnect
- Invalid coin
- Rate limit
- Network failure
- Missing data
- Invalid response
- Server errors

Do not show raw stack traces to users.

Use friendly messages.

---

# 20. Loading States

Use skeleton loaders rather than blank screens.

Examples:

```text
Coin card skeleton
Table row skeleton
Chart skeleton
Statistics skeleton
```

Avoid showing fake cryptocurrency prices during loading.

---

# 21. Data Formatting

Create reusable formatters.

Examples:

```text
$67,234.12
$1.24T
$45.32B
+5.42%
-2.13%
```

Handle very small prices correctly:

```text
$0.00001234
```

Do not round prices so aggressively that meaningful information disappears.

---

# 22. Performance

Optimize the application for performance.

Requirements:

- Lazy-load routes where appropriate
- Avoid unnecessary React re-renders
- Memoize expensive components
- Debounce search
- Virtualize very large market lists if needed
- Optimize images
- Avoid unnecessary API calls
- Clean up WebSocket subscriptions
- Clean up timers/listeners on component unmount

---

# 23. State Management

For a small-to-medium application, use React Context or Zustand.

Suggested state:

```text
market data
selected currency
watchlist
theme
search state
WebSocket connection status
```

Keep server data separate from UI state where practical.

---

# 24. Charts

Use a professional charting library.

Required chart types:

### Price Chart

Line/area chart.

### Sparkline

Small chart used inside market rows/cards.

The chart must be responsive.

Do not overload charts with unnecessary visual elements.

---

# 25. Accessibility

Follow basic accessibility standards.

Include:

- Semantic HTML
- Keyboard navigation
- Accessible buttons
- Proper labels
- Sufficient contrast
- Alt text for meaningful images
- Focus states

Do not rely only on color to communicate gain/loss.

For example:

```text
+5.23% ↑
-2.13% ↓
```

---

# 26. SEO

Add:

- Proper page titles
- Meta descriptions
- Open Graph metadata
- Semantic HTML
- Dynamic coin-page metadata where practical

Example:

```text
Bitcoin (BTC) Price, Market Cap & Chart | Crypto Dashboard
```

---

# 27. Project Structure

Use a clean structure similar to:

```text
crypto-dashboard/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── utils/
│   │   ├── types/
│   │   ├── assets/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── config/
│   │   ├── types/
│   │   └── server.ts
│   │
│   ├── .env.example
│   └── package.json
│
├── README.md
└── .gitignore
```

---

# 28. Important UX Details

When a user opens the website:

1. Show the dashboard immediately.
2. Display cached/previous data if safely available.
3. Begin loading fresh market data.
4. Establish the live connection.
5. Display `LIVE` when real-time updates are active.
6. Update prices without refreshing the page.
7. Keep the interface stable while data changes.

Do not cause the entire page to flash every time a price updates.

---

# 29. Mobile Navigation

Create a mobile-friendly bottom navigation or hamburger navigation.

Recommended sections:

```text
Home
Markets
Watchlist
Search
```

Desktop can use a sidebar or top navigation.

---

# 30. Optional Portfolio Feature

Prepare the architecture for a future portfolio feature.

Potential future functionality:

```text
Add transaction
Buy/Sell
Quantity
Purchase price
Current value
Profit/Loss
Portfolio allocation
```

Do not implement a complicated portfolio system unless requested.

---

# 31. Future Features

Structure the project so these can be added later:

- User authentication
- Cloud watchlist
- Portfolio tracking
- Price alerts
- Push notifications
- Favorite coins
- News
- Fear & Greed Index
- On-chain data
- Exchange comparison
- Gas fees
- NFT data
- DeFi statistics
- AI market summaries

Do not implement all of these in the MVP.

---

# 32. MVP Priority

Build features in this order:

## Phase 1 — Foundation

- Project setup
- Routing
- Tailwind
- Layout
- Theme
- API service layer

## Phase 2 — Market Data

- Global statistics
- Cryptocurrency list
- Search
- Coin details
- Historical prices

## Phase 3 — Real-Time

- WebSocket connection
- Live prices
- Connection status
- Reconnection logic

## Phase 4 — User Features

- Watchlist
- Local storage
- Currency selection

## Phase 5 — Polish

- Loading states
- Error states
- Responsive design
- Accessibility
- SEO
- Performance optimization

---

# 33. Important Development Rules

1. Use TypeScript throughout the project.
2. Avoid `any` unless absolutely necessary.
3. Create reusable components.
4. Keep API logic out of UI components.
5. Keep environment variables secure.
6. Never hardcode live cryptocurrency prices.
7. Never fabricate missing API data.
8. Handle API failures gracefully.
9. Keep the UI responsive.
10. Use clean naming conventions.
11. Add comments only where they provide useful context.
12. Keep components reasonably small.
13. Avoid unnecessary dependencies.
14. Clean up WebSocket connections and subscriptions.
15. Do not expose backend secrets to the browser.

---

# 34. Deliverables

The final project should include:

- Fully working frontend
- Fully working backend
- Real cryptocurrency market data
- Real-time price updates
- Responsive dashboard
- Markets page
- Coin detail page
- Search
- Watchlist
- Charts
- Dark/light theme
- Error handling
- Loading states
- `.env.example`
- README
- Setup instructions
- Development commands
- Production build instructions
- Deployment instructions

---

# 35. README Requirements

The README must explain:

## Installation

```bash
npm install
```

or the appropriate package-manager commands.

## Environment Variables

Explain every required environment variable.

## Development

Explain how to start:

```text
frontend
backend
```

## Production

Explain how to build and deploy.

## API Provider

Document:

- Which provider is being used
- Which endpoints/features are used
- Which data is real-time
- Any rate limits relevant to the project

---

# 36. Final Quality Requirement

Before considering the project complete, verify:

- [ ] Homepage loads correctly
- [ ] Market data loads
- [ ] Prices update automatically
- [ ] WebSocket reconnects after disconnect
- [ ] Search works
- [ ] Coin detail pages work
- [ ] Historical charts work
- [ ] Watchlist works
- [ ] Currency selection works
- [ ] Dark/light mode works
- [ ] Mobile layout works
- [ ] Loading states work
- [ ] API errors are handled
- [ ] Rate limits are handled
- [ ] API keys are not exposed
- [ ] No fake market data is displayed
- [ ] No major console errors
- [ ] Production build succeeds

---

# 37. Instructions to the AI Coding Agent

You are an experienced full-stack engineer and UI/UX developer.

Build this project completely rather than producing only a mockup.

First:

1. Analyze the requirements.
2. Choose the appropriate crypto market-data provider.
3. Explain the architecture briefly.
4. Create the project structure.
5. Implement the backend.
6. Implement the frontend.
7. Connect the frontend to the backend.
8. Implement real-time updates.
9. Test all major flows.
10. Fix errors before finishing.
11. Provide clear setup instructions.

Do not use fake cryptocurrency data except for explicit UI development placeholders before the real API integration is complete.

If an API provider does not support a required feature, adapt the implementation rather than pretending that it does.

Keep provider-specific code isolated so the provider can be replaced later.

The finished application should look and behave like a real production crypto market dashboard.
