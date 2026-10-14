import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { CryptoMarketItem } from '../../types/crypto';
import { useCrypto } from '../../store/useCryptoStore';
import { formatPrice, formatPercentage } from '../../utils/formatters';
import { Skeleton } from '../common/SkeletonLoader';

interface GainersLosersProps {
  gainers: CryptoMarketItem[];
  losers: CryptoMarketItem[];
  loading: boolean;
}

export const GainersLosersSection: React.FC<GainersLosersProps> = ({
  gainers,
  losers,
  loading,
}) => {
  const { currency, liveTicks } = useCrypto();

  const renderList = (items: CryptoMarketItem[], isGainer: boolean) => {
    if (loading) {
      return (
        <div className="space-y-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800/60"
            >
              <div className="flex items-center gap-2.5">
                <Skeleton className="w-7 h-7 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-3.5 w-16" />
                  <Skeleton className="h-2.5 w-8" />
                </div>
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      );
    }

    if (!items || items.length === 0) {
      return (
        <div className="py-6 text-center text-slate-500 text-xs">
          No items currently available.
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {items.slice(0, 5).map((coin) => {
          const liveTick = liveTicks[coin.id] || liveTicks[coin.symbol.toLowerCase()];
          const price = liveTick ? liveTick.priceUsd : coin.current_price;
          const change = liveTick
            ? liveTick.priceChangePercent24h
            : coin.price_change_percentage_24h;
          const changeFormatted = formatPercentage(change);

          return (
            <Link
              key={coin.id}
              to={`/coin/${coin.id}`}
              className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-900/60 hover:bg-slate-850/80 border border-slate-800/60 hover:border-slate-700 transition group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={coin.image}
                  alt={coin.name}
                  className="w-7 h-7 rounded-full shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="truncate">
                  <div className="text-sm font-semibold text-white truncate">
                    {coin.name}
                  </div>
                  <div className="text-xs uppercase text-slate-400 font-medium">
                    {coin.symbol}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm font-mono font-medium text-white">
                  {formatPrice(price, currency)}
                </div>
                <div
                  className={`text-xs font-semibold ${
                    changeFormatted.isPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {changeFormatted.text}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Top Gainers Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base">Top 24h Gainers</h3>
          </div>
          <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
            Surging
          </span>
        </div>
        {renderList(gainers, true)}
      </div>

      {/* Top Losers Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base">Top 24h Losers</h3>
          </div>
          <span className="text-xs text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-full">
            Declining
          </span>
        </div>
        {renderList(losers, false)}
      </div>
    </div>
  );
};
