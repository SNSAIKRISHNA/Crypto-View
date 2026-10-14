import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ChevronRight } from 'lucide-react';
import { CryptoMarketItem } from '../../types/crypto';
import { useCrypto } from '../../store/useCryptoStore';
import {
  formatPrice,
  formatCompactNumber,
  formatPercentage,
} from '../../utils/formatters';
import { Sparkline } from '../common/Sparkline';
import { TableRowSkeleton } from '../common/SkeletonLoader';

interface TopCryptosTableProps {
  coins: CryptoMarketItem[];
  loading: boolean;
  limit?: number;
  showViewAll?: boolean;
}

export const TopCryptosTable: React.FC<TopCryptosTableProps> = ({
  coins,
  loading,
  limit = 10,
  showViewAll = true,
}) => {
  const {
    currency,
    liveTicks,
    priceFlashes,
    isInWatchlist,
    toggleWatchlist,
  } = useCrypto();

  const displayedCoins = limit ? coins.slice(0, limit) : coins;

  return (
    <div className="rounded-xl bg-[#0f121a] border border-[#1e2333] overflow-hidden">
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#1e2333] bg-[#0c0e14]">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white font-heading tracking-tight">
            Cryptocurrency Market Ranking
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time live prices & 24h volume tracking
          </p>
        </div>
        {showViewAll && (
          <Link
            to="/markets"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161a26] hover:bg-[#1f2434] text-xs font-semibold text-emerald-400 border border-[#262c3e] transition"
          >
            <span>View All Markets</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1e2333] text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider bg-[#0a0b0f]">
              <th className="py-3 px-3 sm:px-4 w-10 text-center">#</th>
              <th className="py-3 px-3 sm:px-4">Asset</th>
              <th className="py-3 px-3 sm:px-4 text-right">Price</th>
              <th className="py-3 px-3 sm:px-4 text-right hidden sm:table-cell">1h</th>
              <th className="py-3 px-3 sm:px-4 text-right">24h</th>
              <th className="py-3 px-3 sm:px-4 text-right hidden md:table-cell">7d</th>
              <th className="py-3 px-3 sm:px-4 text-right hidden lg:table-cell">24h Volume</th>
              <th className="py-3 px-3 sm:px-4 text-right">Market Cap</th>
              <th className="py-3 px-3 sm:px-4 text-center hidden xl:table-cell">Last 7 Days</th>
              <th className="py-3 px-2 sm:px-3 text-center w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-sm font-medium">
            {loading ? (
              Array.from({ length: limit }).map((_, i) => (
                <TableRowSkeleton key={i} cols={9} />
              ))
            ) : displayedCoins.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400 text-sm">
                  No cryptocurrency data available right now.
                </td>
              </tr>
            ) : (
              displayedCoins.map((coin) => {
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

                    {/* Coin Identity */}
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
                          width={110}
                          height={36}
                          isPositive={(coin.price_change_percentage_7d_in_currency ?? 0) >= 0}
                        />
                      </div>
                    </td>

                    {/* Star / Watchlist Button */}
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
    </div>
  );
};
