import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Star } from 'lucide-react';
import { useCrypto } from '../../store/useCryptoStore';
import { formatPrice, formatPercentage } from '../../utils/formatters';
import { Skeleton } from '../common/SkeletonLoader';

interface TrendingCarouselProps {
  trendingCoins: any[];
  loading: boolean;
}

export const TrendingCarousel: React.FC<TrendingCarouselProps> = ({ trendingCoins, loading }) => {
  const { currency, liveTicks, isInWatchlist, toggleWatchlist } = useCrypto();

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
          <h2 className="text-lg font-bold text-white tracking-tight">Trending Cryptocurrencies</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!trendingCoins || trendingCoins.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400">
            <Flame className="w-4 h-4 fill-amber-400" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Trending Assets
          </h2>
        </div>
        <span className="text-xs text-slate-400">Past 24 Hours</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {trendingCoins.slice(0, 4).map((item: any) => {
          const coin = item.item || item;
          const liveTick = liveTicks[coin.id] || liveTicks[coin.symbol?.toLowerCase()];
          const price = liveTick ? liveTick.priceUsd : coin.data?.price || 0;
          const change24h = liveTick
            ? liveTick.priceChangePercent24h
            : coin.data?.price_change_percentage_24h?.usd || 0;
          const changeFormatted = formatPercentage(change24h);
          const isStarred = isInWatchlist(coin.id);

          return (
            <div
              key={coin.id}
              className="relative group p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/50 border border-slate-800/90 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 transition-all"
            >
              <div className="flex items-start justify-between">
                <Link to={`/coin/${coin.id}`} className="flex items-center gap-3 min-w-0">
                  <img
                    src={coin.small || coin.thumb}
                    alt={coin.name}
                    className="w-9 h-9 rounded-full bg-slate-800 p-0.5 shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="truncate">
                    <div className="font-semibold text-white truncate text-sm">
                      {coin.name}
                    </div>
                    <div className="text-xs uppercase text-slate-400 font-medium">
                      {coin.symbol}
                      <span className="ml-1.5 text-[10px] text-slate-500">
                        #{coin.market_cap_rank || '—'}
                      </span>
                    </div>
                  </div>
                </Link>

                <button
                  onClick={() => toggleWatchlist(coin.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-slate-800/80 transition"
                  title={isStarred ? 'Remove from Watchlist' : 'Add to Watchlist'}
                >
                  <Star
                    className={`w-4 h-4 ${
                      isStarred ? 'text-amber-400 fill-amber-400' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="mt-3.5 flex items-baseline justify-between pt-2 border-t border-slate-800/40">
                <span className="text-sm sm:text-base font-bold font-mono text-white">
                  {typeof price === 'string'
                    ? price
                    : formatPrice(price, currency)}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    changeFormatted.isPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {changeFormatted.text}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
