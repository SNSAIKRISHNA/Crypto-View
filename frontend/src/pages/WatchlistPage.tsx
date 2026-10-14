import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Trash2, TrendingUp, TrendingDown, ArrowRight, LayoutGrid, List } from 'lucide-react';
import { useCrypto } from '../store/useCryptoStore';
import { api } from '../services/api';
import { CryptoMarketItem } from '../types/crypto';
import {
  formatPrice,
  formatCompactNumber,
  formatPercentage,
} from '../utils/formatters';
import { Sparkline } from '../components/common/Sparkline';
import { TableRowSkeleton } from '../components/common/SkeletonLoader';

export const WatchlistPage: React.FC = () => {
  const {
    watchlist,
    removeFromWatchlist,
    currency,
    liveTicks,
    priceFlashes,
  } = useCrypto();

  const [coins, setCoins] = useState<CryptoMarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    let isMounted = true;
    const fetchWatchlistCoins = async () => {
      if (watchlist.length === 0) {
        setCoins([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const allCoins = await api.getMarkets(currency, 1, 100, 'market_cap_desc', true);
        if (isMounted) {
          const filtered = allCoins.filter((c) => watchlist.includes(c.id));
          setCoins(filtered);
        }
      } catch (err) {
        console.error('Failed to fetch watchlist market data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchWatchlistCoins();

    return () => {
      isMounted = false;
    };
  }, [watchlist, currency]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              My Watchlist
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Tracking {watchlist.length} pinned {watchlist.length === 1 ? 'cryptocurrency' : 'cryptocurrencies'} with live price feeds
          </p>
        </div>

        {/* View Toggle */}
        {watchlist.length > 0 && (
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {watchlist.length === 0 ? (
        <div className="p-12 sm:p-16 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto text-amber-400">
            <Star className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Your watchlist is empty</h3>
            <p className="text-sm text-slate-400 mt-1">
              Add your favorite cryptocurrencies to track their prices, 24h movements, and sparklines in one convenient place.
            </p>
          </div>
          <Link
            to="/markets"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold shadow-lg shadow-emerald-500/20 transition active:scale-95"
          >
            <span>Explore Markets</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: watchlist.length }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse h-40" />
          ))}
        </div>
      ) : viewMode === 'grid' ? (
        /* Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coins.map((coin) => {
            const liveTick = liveTicks[coin.id] || liveTicks[coin.symbol.toLowerCase()];
            const price = liveTick ? liveTick.priceUsd : coin.current_price;
            const change = liveTick
              ? liveTick.priceChangePercent24h
              : coin.price_change_percentage_24h;
            const changeFmt = formatPercentage(change);
            const flash = priceFlashes[coin.id] || priceFlashes[coin.symbol.toLowerCase()];

            return (
              <div
                key={coin.id}
                className="relative group p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition shadow-sm flex flex-col justify-between"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <Link to={`/coin/${coin.id}`} className="flex items-center gap-3 min-w-0">
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="w-10 h-10 rounded-full bg-slate-800 p-0.5 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="truncate">
                      <div className="font-bold text-white truncate text-base group-hover:text-emerald-400 transition-colors">
                        {coin.name}
                      </div>
                      <div className="text-xs uppercase text-slate-400 font-semibold font-mono">
                        {coin.symbol}
                      </div>
                    </div>
                  </Link>

                  <button
                    onClick={() => removeFromWatchlist(coin.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                    title="Remove from watchlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Price and 24h change */}
                <div className="my-4 flex items-baseline justify-between">
                  <span
                    className={`text-2xl font-black font-mono tracking-tight text-white transition-all duration-300 ${
                      flash === 'up'
                        ? 'text-emerald-400'
                        : flash === 'down'
                        ? 'text-rose-400'
                        : ''
                    }`}
                  >
                    {formatPrice(price, currency)}
                  </span>
                  <div
                    className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg ${
                      changeFmt.isPositive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {changeFmt.isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>{changeFmt.text}</span>
                  </div>
                </div>

                {/* Sparkline mini chart */}
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">7D Trend</span>
                  <Sparkline
                    data={coin.sparkline_in_7d?.price}
                    width={130}
                    height={38}
                    isPositive={(coin.price_change_percentage_7d_in_currency ?? 0) >= 0}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 overflow-hidden backdrop-blur">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                  <th className="py-3 px-4">Coin</th>
                  <th className="py-3 px-4 text-right">Price</th>
                  <th className="py-3 px-4 text-right">24h</th>
                  <th className="py-3 px-4 text-right hidden sm:table-cell">Market Cap</th>
                  <th className="py-3 px-4 text-center hidden md:table-cell">7-Day Trend</th>
                  <th className="py-3 px-4 text-center w-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-sm font-medium">
                {coins.map((coin) => {
                  const liveTick = liveTicks[coin.id] || liveTicks[coin.symbol.toLowerCase()];
                  const price = liveTick ? liveTick.priceUsd : coin.current_price;
                  const change = liveTick
                    ? liveTick.priceChangePercent24h
                    : coin.price_change_percentage_24h;
                  const changeFmt = formatPercentage(change);
                  const flash = priceFlashes[coin.id] || priceFlashes[coin.symbol.toLowerCase()];

                  return (
                    <tr key={coin.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <Link to={`/coin/${coin.id}`} className="flex items-center gap-3">
                          <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                          <div>
                            <div className="font-semibold text-white">{coin.name}</div>
                            <div className="text-xs uppercase text-slate-400">{coin.symbol}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                        <span className={flash === 'up' ? 'text-emerald-400' : flash === 'down' ? 'text-rose-400' : ''}>
                          {formatPrice(price, currency)}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 text-right font-mono text-xs font-semibold ${changeFmt.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {changeFmt.text}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-300 hidden sm:table-cell">
                        {formatCompactNumber(coin.market_cap, currency)}
                      </td>
                      <td className="py-3.5 px-4 text-center hidden md:table-cell">
                        <div className="flex justify-center">
                          <Sparkline
                            data={coin.sparkline_in_7d?.price}
                            width={100}
                            height={32}
                            isPositive={(coin.price_change_percentage_7d_in_currency ?? 0) >= 0}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => removeFromWatchlist(coin.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                          title="Remove from watchlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
