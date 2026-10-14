import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ArrowUpDown,
  RefreshCw,
  Star,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Filter,
} from 'lucide-react';
import { useCrypto } from '../store/useCryptoStore';
import { api } from '../services/api';
import { CryptoMarketItem } from '../types/crypto';
import {
  formatPrice,
  formatCompactNumber,
  formatPercentage,
  formatSupply,
} from '../utils/formatters';
import { Sparkline } from '../components/common/Sparkline';
import { TableRowSkeleton } from '../components/common/SkeletonLoader';

type SortField = 'market_cap_rank' | 'current_price' | 'price_change_percentage_24h' | 'total_volume' | 'market_cap';
type SortOrder = 'asc' | 'desc';
type FilterType = 'all' | 'gainers' | 'losers';

export const MarketsPage: React.FC = () => {
  const {
    currency,
    liveTicks,
    priceFlashes,
    isInWatchlist,
    toggleWatchlist,
  } = useCrypto();

  const [coins, setCoins] = useState<CryptoMarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Sorting state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('market_cap_rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const fetchMarkets = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setError(null);

    try {
      // Fetch up to 100 top coins
      const data = await api.getMarkets(currency, 1, 100, 'market_cap_desc', true);
      setCoins(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch market list');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
    const timer = setInterval(() => fetchMarkets(), 60000);
    return () => clearInterval(timer);
  }, [currency]);

  // Handle column sort toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder(field === 'market_cap_rank' ? 'asc' : 'desc');
    }
  };

  // Filter & Sort calculation
  const filteredAndSortedCoins = useMemo(() => {
    let result = [...coins];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.symbol.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (filterType === 'gainers') {
      result = result.filter((c) => (c.price_change_percentage_24h ?? 0) > 0);
    } else if (filterType === 'losers') {
      result = result.filter((c) => (c.price_change_percentage_24h ?? 0) < 0);
    }

    // Sorting
    result.sort((a, b) => {
      let valA: number = (a as any)[sortField] ?? 0;
      let valB: number = (b as any)[sortField] ?? 0;

      // Use real-time tick price or change if available
      if (sortField === 'current_price') {
        const tickA = liveTicks[a.id] || liveTicks[a.symbol.toLowerCase()];
        const tickB = liveTicks[b.id] || liveTicks[b.symbol.toLowerCase()];
        if (tickA) valA = tickA.priceUsd;
        if (tickB) valB = tickB.priceUsd;
      } else if (sortField === 'price_change_percentage_24h') {
        const tickA = liveTicks[a.id] || liveTicks[a.symbol.toLowerCase()];
        const tickB = liveTicks[b.id] || liveTicks[b.symbol.toLowerCase()];
        if (tickA) valA = tickA.priceChangePercent24h;
        if (tickB) valB = tickB.priceChangePercent24h;
      }

      if (sortOrder === 'asc') {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });

    return result;
  }, [coins, searchTerm, filterType, sortField, sortOrder, liveTicks]);

  // Pagination calculation
  const totalItems = filteredAndSortedCoins.length;
  const totalPages = Math.ceil(totalItems / perPage) || 1;
  const paginatedCoins = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredAndSortedCoins.slice(start, start + perPage);
  }, [filteredAndSortedCoins, currentPage, perPage]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, perPage]);

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Cryptocurrency Markets
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse, filter, and track over {coins.length || 100} top digital assets with live prices
          </p>
        </div>

        <button
          onClick={() => fetchMarkets(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
          <span>{refreshing ? 'Updating...' : 'Refresh Prices'}</span>
        </button>
      </div>

      {/* Controls Bar: Search, Category Filters, Rows Per Page */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search coin by name or symbol (e.g. BTC, ETH)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Category Filter Pills & Rows Per Page */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filterType === 'all'
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Coins
            </button>
            <button
              onClick={() => setFilterType('gainers')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filterType === 'gainers'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Gainers</span>
            </button>
            <button
              onClick={() => setFilterType('losers')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filterType === 'losers'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Losers</span>
            </button>
          </div>

          {/* Rows Per Page */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 ml-auto lg:ml-2">
            <span>Show:</span>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="bg-slate-950/70 border border-slate-800 rounded-lg px-2 py-1.5 text-white font-semibold focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Markets Table */}
      <div className="rounded-xl bg-[#0f121a] border border-[#1e2333] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e2333] text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider bg-[#0a0b0f]">
                <th
                  onClick={() => handleSort('market_cap_rank')}
                  className="py-3 px-3 sm:px-4 w-12 text-center cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>#</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-3 sm:px-4">Coin</th>
                <th
                  onClick={() => handleSort('current_price')}
                  className="py-3 px-3 sm:px-4 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Price</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-3 sm:px-4 text-right hidden sm:table-cell">1h</th>
                <th
                  onClick={() => handleSort('price_change_percentage_24h')}
                  className="py-3 px-3 sm:px-4 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>24h</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-3 sm:px-4 text-right hidden md:table-cell">7d</th>
                <th
                  onClick={() => handleSort('total_volume')}
                  className="py-3 px-3 sm:px-4 text-right hidden lg:table-cell cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>24h Volume</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('market_cap')}
                  className="py-3 px-3 sm:px-4 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Market Cap</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-3 sm:px-4 text-right hidden xl:table-cell">Circulating Supply</th>
                <th className="py-3 px-3 sm:px-4 text-center hidden xl:table-cell">7-Day Trend</th>
                <th className="py-3 px-2 sm:px-3 text-center w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm font-medium">
              {loading ? (
                Array.from({ length: 15 }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={10} />
                ))
              ) : paginatedCoins.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-slate-400 text-sm">
                    No cryptocurrencies matched your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedCoins.map((coin) => {
                  const liveTick = liveTicks[coin.id] || liveTicks[coin.symbol.toLowerCase()];
                  const price = liveTick ? liveTick.priceUsd : coin.current_price;
                  const change24h = liveTick
                    ? liveTick.priceChangePercent24h
                    : coin.price_change_percentage_24h;

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
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-3 sm:px-4 text-center text-xs font-semibold text-slate-500 font-mono">
                        {coin.market_cap_rank}
                      </td>

                      {/* Coin info */}
                      <td className="py-3.5 px-3 sm:px-4">
                        <Link
                          to={`/coin/${coin.id}`}
                          className="flex items-center gap-3 min-w-0"
                        >
                          <img
                            src={coin.image}
                            alt={coin.name}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 shrink-0 group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                          <div className="truncate">
                            <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                              {coin.name}
                            </div>
                            <div className="text-xs uppercase text-slate-400 font-mono font-medium">
                              {coin.symbol}
                            </div>
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

                      {/* Volume */}
                      <td className="py-3.5 px-3 sm:px-4 text-right hidden lg:table-cell font-mono text-xs text-slate-300 whitespace-nowrap">
                        {formatCompactNumber(coin.total_volume, currency)}
                      </td>

                      {/* Market Cap */}
                      <td className="py-3.5 px-3 sm:px-4 text-right font-mono text-xs text-slate-300 whitespace-nowrap">
                        {formatCompactNumber(coin.market_cap, currency)}
                      </td>

                      {/* Circulating Supply */}
                      <td className="py-3.5 px-3 sm:px-4 text-right hidden xl:table-cell font-mono text-xs text-slate-400 whitespace-nowrap">
                        {formatSupply(coin.circulating_supply, coin.symbol)}
                      </td>

                      {/* Sparkline (7d chart) */}
                      <td className="py-3.5 px-3 sm:px-4 text-center hidden xl:table-cell">
                        <div className="flex justify-center">
                          <Sparkline
                            data={coin.sparkline_in_7d?.price}
                            width={110}
                            height={36}
                            isPositive={(coin.price_change_percentage_7d_in_currency ?? 0) >= 0}
                          />
                        </div>
                      </td>

                      {/* Watchlist toggle */}
                      <td className="py-3.5 px-2 sm:px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWatchlist(coin.id);
                          }}
                          className="p-1 rounded-md text-slate-500 hover:text-amber-400 hover:bg-slate-800 transition"
                          title={isStarred ? 'Remove from Watchlist' : 'Add to Watchlist'}
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

        {/* Pagination Bar */}
        <div className="px-4 py-3.5 bg-slate-950/60 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-white">{(currentPage - 1) * perPage + 1}</span> to{' '}
            <span className="font-semibold text-white">
              {Math.min(currentPage * perPage, totalItems)}
            </span>{' '}
            of <span className="font-semibold text-white">{totalItems}</span> assets
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 transition"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-semibold text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 transition"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
