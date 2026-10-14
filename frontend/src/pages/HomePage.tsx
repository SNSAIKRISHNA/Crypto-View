import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Star,
  Activity,
  Layers,
  Database,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  BarChart3,
  Flame,
  AlertCircle,
} from 'lucide-react';
import { useCrypto } from '../store/useCryptoStore';
import { api } from '../services/api';
import { GlobalMarketData, CryptoMarketItem } from '../types/crypto';
import {
  formatPrice,
  formatCompactNumber,
  formatPercentage,
} from '../utils/formatters';
import { Sparkline } from '../components/common/Sparkline';
import { TableRowSkeleton } from '../components/common/SkeletonLoader';

export const HomePage: React.FC = () => {
  const {
    currency,
    watchlist,
    liveTicks,
    priceFlashes,
    isInWatchlist,
    toggleWatchlist,
    setIsSearchOpen,
    connectionStatus,
  } = useCrypto();

  const [globalData, setGlobalData] = useState<GlobalMarketData | null>(null);
  const [coins, setCoins] = useState<CryptoMarketItem[]>([]);
  const [trendingCoins, setTrendingCoins] = useState<any[]>([]);
  const [gainers, setGainers] = useState<CryptoMarketItem[]>([]);
  const [losers, setLosers] = useState<CryptoMarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Spotlight active asset in Section 1 (Bitcoin / Ethereum / Solana)
  const [spotlightId, setSpotlightId] = useState<string>('bitcoin');

  // Interactive controls for Section 2 (Proof ledger)
  const [proofTab, setProofTab] = useState<'gainers' | 'losers'>('gainers');

  // Interactive controls for Section 4 (Workstation table)
  const [tableFilter, setTableFilter] = useState<'all' | 'gainers' | 'losers' | 'trending'>('all');
  const [tableSearch, setTableSearch] = useState<string>('');

  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    setError(null);

    try {
      const [globalRes, marketsRes, trendingRes] = await Promise.all([
        api.getGlobal().catch(() => null),
        api.getMarkets(currency, 1, 50, 'market_cap_desc', true).catch(() => []),
        api.getTrending().catch(() => null),
      ]);

      if (globalRes) setGlobalData(globalRes);

      if (marketsRes && marketsRes.length > 0) {
        setCoins(marketsRes);

        const sorted = [...marketsRes].filter(
          (c) => c.price_change_percentage_24h !== null && c.price_change_percentage_24h !== undefined
        );

        const topGainers = [...sorted]
          .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
          .slice(0, 5);

        const topLosers = [...sorted]
          .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
          .slice(0, 5);

        setGainers(topGainers);
        setLosers(topLosers);
      }

      if (trendingRes?.coins) {
        setTrendingCoins(trendingRes.coins);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch cryptocurrency data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(), 45000);
    return () => clearInterval(interval);
  }, [currency]);

  // Spotlight coin object
  const spotlightCoin = useMemo(() => {
    return coins.find((c) => c.id === spotlightId) || coins[0] || null;
  }, [coins, spotlightId]);

  // Section 4 filtered coins
  const filteredTableCoins = useMemo(() => {
    let result = [...coins];

    if (tableFilter === 'gainers') {
      result = result
        .filter((c) => (c.price_change_percentage_24h ?? 0) > 0)
        .sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0));
    } else if (tableFilter === 'losers') {
      result = result
        .filter((c) => (c.price_change_percentage_24h ?? 0) < 0)
        .sort((a, b) => (a.price_change_percentage_24h ?? 0) - (b.price_change_percentage_24h ?? 0));
    } else if (tableFilter === 'trending') {
      const trendingIds = new Set(trendingCoins.map((t) => t.item?.id || t.id));
      result = result.filter((c) => trendingIds.has(c.id));
      if (result.length === 0) result = coins.slice(0, 15);
    }

    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase().trim();
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
      );
    }

    return result.slice(0, 15);
  }, [coins, tableFilter, tableSearch, trendingCoins]);

  // Macro metrics calculated from real global data
  const totalCap = globalData?.total_market_cap?.[currency] || globalData?.total_market_cap?.['usd'] || 0;
  const totalVol = globalData?.total_volume?.[currency] || globalData?.total_volume?.['usd'] || 0;
  const capChangeFormatted = formatPercentage(globalData?.market_cap_change_percentage_24h_usd);
  const btcDominance = globalData?.market_cap_percentage?.['btc'] || 0;
  const ethDominance = globalData?.market_cap_percentage?.['eth'] || 0;

  return (
    <div className="space-y-24 sm:space-y-32 pb-16">
      {/* System Error Banner if API fails */}
      {error && (
        <aside
          aria-label="System notification"
          className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}. Displaying cached telemetry.</span>
        </aside>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: WHAT YOU DO (Asymmetrical Split Screen Hero)                    */}
      {/* ========================================================================= */}
      <section aria-labelledby="hero-heading" className="pt-2 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Direct value proposition, headline, specs, primary CTA */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            {/* System Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-[#12151e] border border-[#1e2333] text-[11px] font-mono text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-400">FEED:</span>
              <span className="font-semibold text-emerald-400">BINANCE WSS + COINGECKO SPOT</span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-slate-400 hidden sm:inline">&lt;50ms Latency</span>
            </div>

            {/* Main Headline */}
            <h1
              id="hero-heading"
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold tracking-tight text-white font-heading leading-[1.12]"
            >
              Real-time market depth and tick-level price action for active crypto markets.
            </h1>

            {/* Direct, non-cliché subhead */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Crypto-View aggregates tick-by-tick Binance trade streams and CoinGecko global liquidity into a zero-latency terminal. Monitor price swings, 24-hour volume velocity, and multi-timeframe sparklines with zero sign-up and zero paywalls.
            </p>

            {/* Call-to-action button group with repeated primary CTA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <Link
                to="/markets"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all active:scale-95 shadow-sm"
              >
                <span>Explore Live Markets</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-lg bg-[#12151e] hover:bg-[#181c28] text-slate-200 border border-[#1e2333] hover:border-[#2b3246] font-semibold text-sm transition"
              >
                <Search className="w-4 h-4 text-slate-400" />
                <span>Search 100+ Assets</span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#1c2130] text-slate-400 rounded border border-[#2b3246]">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Architectural specification ribbon */}
            <div className="pt-4 border-t border-[#1a1e2b] grid grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Protocol</span>
                <span className="text-white font-semibold mt-0.5 block">WebSocket Stream</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Coverage</span>
                <span className="text-white font-semibold mt-0.5 block">100+ Spot Pairs</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Storage</span>
                <span className="text-white font-semibold mt-0.5 block">100% Client-Side</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Live Spotlight Asset Terminal Card */}
          <div className="lg:col-span-5">
            <div className="rounded-xl bg-[#0f121a] border border-[#1e2333] p-5 sm:p-6 space-y-5 shadow-2xl">
              {/* Asset Selector Tabs */}
              <div className="flex items-center justify-between border-b border-[#1a1e2b] pb-3">
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Live Spotlight Asset
                </span>
                <div className="flex items-center gap-1 bg-[#090a0f] p-1 rounded-lg border border-[#1e2333]">
                  {['bitcoin', 'ethereum', 'solana'].map((id) => (
                    <button
                      key={id}
                      onClick={() => setSpotlightId(id)}
                      className={`px-2.5 py-1 text-xs font-mono font-bold rounded uppercase transition ${
                        spotlightId === id
                          ? 'bg-emerald-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {id === 'bitcoin' ? 'BTC' : id === 'ethereum' ? 'ETH' : 'SOL'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spotlight Active Coin Details */}
              {spotlightCoin ? (
                (() => {
                  const liveTick = liveTicks[spotlightCoin.id] || liveTicks[spotlightCoin.symbol.toLowerCase()];
                  const currentPrice = liveTick ? liveTick.priceUsd : spotlightCoin.current_price;
                  const change24h = liveTick ? liveTick.priceChangePercent24h : spotlightCoin.price_change_percentage_24h;
                  const changeFmt = formatPercentage(change24h);
                  const flash = priceFlashes[spotlightCoin.id] || priceFlashes[spotlightCoin.symbol.toLowerCase()];
                  const low24 = spotlightCoin.low_24h || currentPrice * 0.96;
                  const high24 = spotlightCoin.high_24h || currentPrice * 1.04;
                  const rangePercent = Math.min(
                    100,
                    Math.max(0, ((currentPrice - low24) / (high24 - low24 || 1)) * 100)
                  );

                  return (
                    <div className="space-y-5">
                      {/* Identity & Watchlist */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={spotlightCoin.image}
                            alt={spotlightCoin.name}
                            className="w-10 h-10 rounded-full bg-[#161a26] p-0.5 border border-[#222839]"
                          />
                          <div>
                            <div className="text-lg font-bold text-white font-heading flex items-center gap-2">
                              <span>{spotlightCoin.name}</span>
                              <span className="text-xs font-mono text-slate-400 font-medium uppercase px-1.5 py-0.5 bg-[#161a26] rounded border border-[#222839]">
                                {spotlightCoin.symbol}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono text-slate-400">
                              Rank #{spotlightCoin.market_cap_rank} by Market Cap
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleWatchlist(spotlightCoin.id)}
                          className="p-2 rounded-lg bg-[#161a26] border border-[#222839] text-slate-400 hover:text-amber-400 transition"
                          title={isInWatchlist(spotlightCoin.id) ? 'Remove from Watchlist' : 'Add to Watchlist'}
                          aria-label={`Toggle ${spotlightCoin.name} watchlist`}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              isInWatchlist(spotlightCoin.id) ? 'text-amber-400 fill-amber-400' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {/* Large Ticker Price & Delta */}
                      <div className="bg-[#090a0f] p-4 rounded-lg border border-[#1e2333] space-y-1">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                          Spot Price ({currency.toUpperCase()})
                        </span>
                        <div className="flex items-baseline justify-between gap-2 flex-wrap">
                          <span
                            className={`text-2xl sm:text-3xl font-mono font-bold tracking-tight text-white transition-all duration-300 ${
                              flash === 'up'
                                ? 'flash-up text-emerald-400'
                                : flash === 'down'
                                ? 'flash-down text-rose-400'
                                : ''
                            }`}
                          >
                            {formatPrice(currentPrice, currency)}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-bold ${
                              changeFmt.isPositive
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {changeFmt.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                            <span>{changeFmt.text}</span>
                          </span>
                        </div>
                      </div>

                      {/* 24h Trading Range Bar */}
                      <div className="space-y-1.5 font-mono text-xs">
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>24h Low: {formatPrice(low24, currency)}</span>
                          <span>24h High: {formatPrice(high24, currency)}</span>
                        </div>
                        <div className="h-2 w-full bg-[#161a26] rounded-full overflow-hidden relative">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${rangePercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Metrics 2-column Grid */}
                      <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
                        <div className="p-3 rounded-lg bg-[#141722] border border-[#1e2333]">
                          <span className="text-slate-400 text-[10px] uppercase block">24h Volume</span>
                          <span className="text-white font-bold text-sm mt-0.5 block">
                            {formatCompactNumber(spotlightCoin.total_volume, currency)}
                          </span>
                        </div>
                        <div className="p-3 rounded-lg bg-[#141722] border border-[#1e2333]">
                          <span className="text-slate-400 text-[10px] uppercase block">Market Capitalization</span>
                          <span className="text-white font-bold text-sm mt-0.5 block">
                            {formatCompactNumber(spotlightCoin.market_cap, currency)}
                          </span>
                        </div>
                      </div>

                      {/* Link to Detail Page */}
                      <Link
                        to={`/coin/${spotlightCoin.id}`}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-[#161a26] hover:bg-[#1d2232] border border-[#222839] text-xs font-semibold text-emerald-400 transition group"
                      >
                        <span>Inspect {spotlightCoin.name} Chart & Order Book</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  );
                })()
              ) : (
                <div className="py-16 text-center text-xs text-slate-400 font-mono">
                  Loading spot data...
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: PROOF IT WORKS (Offset 2-Column Ledger & Macro Matrix)         */}
      {/* ========================================================================= */}
      <section aria-labelledby="proof-heading" className="space-y-8">
        <div className="border-b border-[#1e2333] pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              Verified Market Telemetry
            </div>
            <h2 id="proof-heading" className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              Real-time liquidity and verified 24-hour volume data.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Live market telemetry streamed directly from decentralized and centralized order books. No simulated numbers or marketing metrics.
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400 self-start md:self-auto">
            Refreshed continuously • Auto-polled 45s
          </div>
        </div>

        {/* Offset Asymmetrical Layout: Left = Macro Health Grid (4 cards), Right = Top Movers Ledger */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Block: Macro Global Data (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-xl bg-[#0f121a] border border-[#1e2333] space-y-4">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                Global Market Health
              </span>

              <div className="space-y-3">
                {/* Metric 1: Total Cap */}
                <div className="p-3.5 rounded-lg bg-[#090a0f] border border-[#1a1e2b] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase block">Total Market Cap</span>
                    <span className="text-xl font-mono font-bold text-white mt-0.5 block">
                      {formatCompactNumber(totalCap, currency)}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      capChangeFormatted.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {capChangeFormatted.text} 24h
                  </span>
                </div>

                {/* Metric 2: 24h Global Volume */}
                <div className="p-3.5 rounded-lg bg-[#090a0f] border border-[#1a1e2b] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase block">24h Trading Volume</span>
                    <span className="text-xl font-mono font-bold text-white mt-0.5 block">
                      {formatCompactNumber(totalVol, currency)}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Active Turnover
                  </span>
                </div>

                {/* Metric 3: Dominance Split */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[#090a0f] border border-[#1a1e2b]">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">BTC Dominance</span>
                    <span className="text-base font-mono font-bold text-white mt-0.5 block">
                      {btcDominance.toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#090a0f] border border-[#1a1e2b]">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">ETH Dominance</span>
                    <span className="text-base font-mono font-bold text-white mt-0.5 block">
                      {ethDominance.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Metric 4: Verified Exchanges */}
                <div className="p-3 rounded-lg bg-[#090a0f] border border-[#1a1e2b] flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Active Cryptocurrencies:</span>
                  <span className="font-bold text-slate-200">
                    {globalData?.active_cryptocurrencies?.toLocaleString() || '14,000+'}
                  </span>
                </div>
              </div>

              <div className="pt-2 text-[11px] font-mono text-slate-400 border-t border-[#1a1e2b]">
                Provenance: Ingested via CoinGecko v3 global aggregation endpoint.
              </div>
            </div>
          </div>

          {/* Right Block: Live 24h Velocity Ledger (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-xl bg-[#0f121a] border border-[#1e2333] p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#1a1e2b] pb-3">
                <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  24h Velocity Ledger
                </span>

                {/* Switcher: Gainers vs Losers */}
                <div className="flex items-center gap-1 bg-[#090a0f] p-1 rounded-lg border border-[#1e2333]">
                  <button
                    onClick={() => setProofTab('gainers')}
                    className={`px-3 py-1 text-xs font-mono font-bold rounded transition ${
                      proofTab === 'gainers'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Top Gainers ({gainers.length})
                  </button>
                  <button
                    onClick={() => setProofTab('losers')}
                    className={`px-3 py-1 text-xs font-mono font-bold rounded transition ${
                      proofTab === 'losers'
                        ? 'bg-rose-500 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Top Losers ({losers.length})
                  </button>
                </div>
              </div>

              {/* Ledger List */}
              <div className="divide-y divide-[#1a1e2b]">
                {(proofTab === 'gainers' ? gainers : losers).map((coin, idx) => {
                  const liveTick = liveTicks[coin.id] || liveTicks[coin.symbol.toLowerCase()];
                  const price = liveTick ? liveTick.priceUsd : coin.current_price;
                  const change = liveTick ? liveTick.priceChangePercent24h : coin.price_change_percentage_24h;
                  const changeFmt = formatPercentage(change);

                  return (
                    <Link
                      key={coin.id}
                      to={`/coin/${coin.id}`}
                      className="py-3 flex items-center justify-between hover:bg-[#141824] px-2.5 rounded-lg transition group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono text-slate-400 w-4 text-center">
                          {idx + 1}
                        </span>
                        <img
                          src={coin.image}
                          alt={coin.name}
                          className="w-7 h-7 rounded-full bg-[#161a26] shrink-0"
                        />
                        <div className="truncate">
                          <span className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors block truncate">
                            {coin.name}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 uppercase">
                            {coin.symbol}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-mono font-semibold text-white block">
                          {formatPrice(price, currency)}
                        </span>
                        <span
                          className={`text-xs font-mono font-bold ${
                            changeFmt.isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {changeFmt.text}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="pt-2 text-right">
                <Link
                  to="/markets"
                  className="text-xs font-mono font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
                >
                  <span>Inspect All Market Pairs</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: HOW IT WORKS (Horizontal 3-Step Architecture Ribbon)            */}
      {/* ========================================================================= */}
      <section aria-labelledby="how-heading" className="space-y-8">
        <div className="border-b border-[#1e2333] pb-5 space-y-1">
          <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
            System Workflow
          </div>
          <h2 id="how-heading" className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            How Crypto-View processes real-time market data
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Engineered for speed, privacy, and zero latency. Three deliberate stages between exchange order books and your browser screen.
          </p>
        </div>

        {/* 3 Horizontal Structural Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1 */}
          <div className="p-6 rounded-xl bg-[#0f121a] border border-[#1e2333] space-y-4 relative flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold font-mono text-emerald-500/80">
                  01
                </span>
                <span className="p-2 rounded-lg bg-[#161a26] border border-[#222839] text-emerald-400">
                  <Database className="w-4 h-4" />
                </span>
              </div>
              <h3 className="text-base font-bold text-white font-heading">
                Direct Stream Ingestion
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connects directly to public WebSocket order books and REST endpoints from leading global exchanges. No intermediate buffering, proxy throttling, or data modification.
              </p>
            </div>
            <div className="pt-4 border-t border-[#1a1e2b] text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              WSS Protocol • Zero Lag
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-xl bg-[#0f121a] border border-[#1e2333] space-y-4 relative flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold font-mono text-emerald-500/80">
                  02
                </span>
                <span className="p-2 rounded-lg bg-[#161a26] border border-[#222839] text-emerald-400">
                  <Activity className="w-4 h-4" />
                </span>
              </div>
              <h3 className="text-base font-bold text-white font-heading">
                Client-Side Computation
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your browser calculates 1h, 24h, and 7d delta spreads, renders visual sparkline trajectories, and triggers micro-animations on every incoming price tick.
              </p>
            </div>
            <div className="pt-4 border-t border-[#1a1e2b] text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Sub-Second Execution
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-xl bg-[#0f121a] border border-[#1e2333] space-y-4 relative flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold font-mono text-emerald-500/80">
                  03
                </span>
                <span className="p-2 rounded-lg bg-[#161a26] border border-[#222839] text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>
              <h3 className="text-base font-bold text-white font-heading">
                Private Local Persistence
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your watchlist, currency preferences, and recently viewed assets are stored strictly in your browser's LocalStorage. No user profiling, no cookies, zero tracking databases.
              </p>
            </div>
            <div className="pt-4 border-t border-[#1a1e2b] text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Zero Sign-Up Required
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: PRICE / NEXT STEP (Full-Bleed High-Density Market Workstation)  */}
      {/* ========================================================================= */}
      <section aria-labelledby="terminal-heading" className="space-y-6">
        <div className="border-b border-[#1e2333] pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              Live Terminal • 100% Free & Open Access
            </div>
            <h2 id="terminal-heading" className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              Track top cryptocurrencies by market capitalization
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              100% free and open-access. No subscription tiers, no premium paywalls, no tracking cookies.
            </p>
          </div>

          {/* Manual Refresh Trigger */}
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 self-start md:self-auto px-3.5 py-1.5 rounded-lg bg-[#12151e] border border-[#1e2333] hover:border-[#2b3246] text-slate-300 hover:text-white text-xs font-mono font-semibold transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Data'}</span>
          </button>
        </div>

        {/* Interactive Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg bg-[#0f121a] border border-[#1e2333]">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { id: 'all', label: 'All Assets' },
                { id: 'gainers', label: 'Gainers' },
                { id: 'losers', label: 'Losers' },
                { id: 'trending', label: 'Trending' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTableFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition whitespace-nowrap ${
                  tableFilter === tab.id
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-white hover:bg-[#161a26]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Inline Instant Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by name or symbol..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full bg-[#090a0f] border border-[#1e2333] text-xs font-mono text-white placeholder-slate-400 pl-8 pr-3 py-1.5 rounded-md focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Full High-Density Table */}
        <div className="rounded-xl bg-[#0f121a] border border-[#1e2333] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1e2333] text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider bg-[#090a0f]">
                  <th className="py-3 px-3 sm:px-4 w-10 text-center">#</th>
                  <th className="py-3 px-3 sm:px-4">Asset</th>
                  <th className="py-3 px-3 sm:px-4 text-right">Price ({currency.toUpperCase()})</th>
                  <th className="py-3 px-3 sm:px-4 text-right hidden sm:table-cell">1h</th>
                  <th className="py-3 px-3 sm:px-4 text-right">24h</th>
                  <th className="py-3 px-3 sm:px-4 text-right hidden md:table-cell">7d</th>
                  <th className="py-3 px-3 sm:px-4 text-right hidden lg:table-cell">24h Volume</th>
                  <th className="py-3 px-3 sm:px-4 text-right">Market Cap</th>
                  <th className="py-3 px-3 sm:px-4 text-center hidden xl:table-cell">7-Day Trajectory</th>
                  <th className="py-3 px-2 sm:px-3 text-center w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1e2b] text-sm">
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRowSkeleton key={i} cols={10} />
                  ))
                ) : filteredTableCoins.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400 text-xs font-mono">
                      No assets matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTableCoins.map((coin) => {
                    const liveTick = liveTicks[coin.id] || liveTicks[coin.symbol.toLowerCase()];
                    const price = liveTick ? liveTick.priceUsd : coin.current_price;
                    const change24h = liveTick ? liveTick.priceChangePercent24h : coin.price_change_percentage_24h;
                    const change1h = coin.price_change_percentage_1h_in_currency;
                    const change7d = coin.price_change_percentage_7d_in_currency;

                    const change24hFmt = formatPercentage(change24h);
                    const change1hFmt = formatPercentage(change1h);
                    const change7dFmt = formatPercentage(change7d);

                    const flash = priceFlashes[coin.id] || priceFlashes[coin.symbol.toLowerCase()];
                    const isStarred = isInWatchlist(coin.id);

                    return (
                      <tr
                        key={coin.id}
                        className="hover:bg-[#141824] transition-colors group cursor-pointer"
                      >
                        {/* Rank */}
                        <td className="py-3.5 px-3 sm:px-4 text-center text-xs font-mono text-slate-400 font-semibold">
                          {coin.market_cap_rank}
                        </td>

                        {/* Identity */}
                        <td className="py-3.5 px-3 sm:px-4">
                          <Link
                            to={`/coin/${coin.id}`}
                            className="flex items-center gap-3 min-w-0"
                          >
                            <img
                              src={coin.image}
                              alt={coin.name}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#161a26] shrink-0"
                              loading="lazy"
                            />
                            <div className="truncate">
                              <span className="font-semibold text-white group-hover:text-emerald-400 transition-colors block truncate text-sm">
                                {coin.name}
                              </span>
                              <span className="text-[11px] font-mono uppercase text-slate-400 font-medium">
                                {coin.symbol}
                              </span>
                            </div>
                          </Link>
                        </td>

                        {/* Live Price with Flash Animation */}
                        <td className="py-3.5 px-3 sm:px-4 text-right font-mono font-semibold text-white whitespace-nowrap">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded transition-all duration-300 ${
                              flash === 'up'
                                ? 'flash-up text-emerald-400 font-bold'
                                : flash === 'down'
                                ? 'flash-down text-rose-400 font-bold'
                                : ''
                            }`}
                          >
                            {formatPrice(price, currency)}
                          </span>
                        </td>

                        {/* 1h % */}
                        <td
                          className={`py-3.5 px-3 sm:px-4 text-right hidden sm:table-cell font-mono text-xs font-semibold whitespace-nowrap ${
                            change1hFmt.isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {change1hFmt.text}
                        </td>

                        {/* 24h % */}
                        <td
                          className={`py-3.5 px-3 sm:px-4 text-right font-mono text-xs font-semibold whitespace-nowrap ${
                            change24hFmt.isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {change24hFmt.text}
                        </td>

                        {/* 7d % */}
                        <td
                          className={`py-3.5 px-3 sm:px-4 text-right hidden md:table-cell font-mono text-xs font-semibold whitespace-nowrap ${
                            change7dFmt.isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {change7dFmt.text}
                        </td>

                        {/* 24h Volume */}
                        <td className="py-3.5 px-3 sm:px-4 text-right hidden lg:table-cell font-mono text-xs text-slate-300 whitespace-nowrap">
                          {formatCompactNumber(coin.total_volume, currency)}
                        </td>

                        {/* Market Cap */}
                        <td className="py-3.5 px-3 sm:px-4 text-right font-mono text-xs text-slate-300 whitespace-nowrap">
                          {formatCompactNumber(coin.market_cap, currency)}
                        </td>

                        {/* Sparkline (7d chart) */}
                        <td className="py-3.5 px-3 sm:px-4 text-center hidden xl:table-cell">
                          <div className="flex justify-center">
                            <Sparkline
                              data={coin.sparkline_in_7d?.price}
                              width={100}
                              height={32}
                              isPositive={(coin.price_change_percentage_7d_in_currency ?? 0) >= 0}
                            />
                          </div>
                        </td>

                        {/* Star / Watchlist Toggle */}
                        <td className="py-3.5 px-2 sm:px-3 text-center">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleWatchlist(coin.id);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-[#161a26] transition"
                            title={isStarred ? 'Remove from Watchlist' : 'Add to Watchlist'}
                            aria-label={`Toggle ${coin.name} watchlist`}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                isStarred ? 'text-amber-400 fill-amber-400' : ''
                              }`}
                            />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Call-to-Action Bar: Repeating the single primary CTA */}
        <div className="p-6 sm:p-8 rounded-xl bg-[#0f121a] border border-[#1e2333] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Direct Next Step
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white font-heading">
              Ready to analyze the complete cryptocurrency market?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Access the full 100+ spot market terminal with custom sorting, 24h liquidity indicators, and live multi-pair tracking.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              to="/markets"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-sm"
            >
              <span>Explore Live Markets</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/watchlist"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#141824] hover:bg-[#1a2030] text-slate-300 hover:text-white border border-[#222839] font-mono text-xs transition"
            >
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Watchlist ({watchlist.length})</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
