import React from 'react';
import { Activity, BarChart3, PieChart, Coins } from 'lucide-react';
import { GlobalMarketData } from '../../types/crypto';
import { useCrypto } from '../../store/useCryptoStore';
import { formatCompactNumber, formatPercentage } from '../../utils/formatters';
import { CardSkeleton } from '../common/SkeletonLoader';

interface MarketOverviewCardsProps {
  data: GlobalMarketData | null;
  loading: boolean;
}

export const MarketOverviewCards: React.FC<MarketOverviewCardsProps> = ({ data, loading }) => {
  const { currency } = useCrypto();

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const totalCap = data.total_market_cap[currency] || data.total_market_cap['usd'] || 0;
  const totalVol = data.total_volume[currency] || data.total_volume['usd'] || 0;
  const capChange = data.market_cap_change_percentage_24h_usd;
  const btcDom = data.market_cap_percentage?.['btc'] || 0;
  const ethDom = data.market_cap_percentage?.['eth'] || 0;

  const capChangeFormatted = formatPercentage(capChange);

  const cards = [
    {
      title: 'Total Market Cap',
      value: formatCompactNumber(totalCap, currency),
      change: capChangeFormatted.text,
      isPositive: capChangeFormatted.isPositive,
      icon: Coins,
      accent: 'emerald',
    },
    {
      title: '24h Trading Volume',
      value: formatCompactNumber(totalVol, currency),
      change: 'Active Trading',
      isPositive: true,
      icon: Activity,
      accent: 'cyan',
    },
    {
      title: 'BTC Dominance',
      value: `${btcDom.toFixed(1)}%`,
      change: `ETH: ${ethDom.toFixed(1)}%`,
      isPositive: true,
      icon: PieChart,
      accent: 'amber',
    },
    {
      title: 'Tracked Assets',
      value: data.active_cryptocurrencies.toLocaleString(),
      change: `${data.markets} Exchanges`,
      isPositive: true,
      icon: BarChart3,
      accent: 'indigo',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-900/70 backdrop-blur border border-slate-800/80 hover:border-slate-700 transition shadow-sm hover:shadow-md group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 group-hover:scale-105 transition-transform">
                <Icon className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-bold font-mono text-white tracking-tight">
                {card.value}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-medium">
                <span
                  className={
                    card.isPositive
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }
                >
                  {card.change}
                </span>
                {idx === 0 && (
                  <span className="text-slate-500 font-normal">24h change</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
