import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { MarketChartHistory } from '../../types/crypto';
import { useCrypto } from '../../store/useCryptoStore';
import { formatPrice, formatDate } from '../../utils/formatters';
import { Skeleton } from '../common/SkeletonLoader';

interface CoinPriceChartProps {
  history: MarketChartHistory | null;
  loading: boolean;
  selectedDays: string;
  onSelectDays: (days: string) => void;
  coinName: string;
}

const TIMEFRAMES = [
  { label: '24H', days: '1' },
  { label: '7D', days: '7' },
  { label: '30D', days: '30' },
  { label: '90D', days: '90' },
  { label: '1Y', days: '365' },
  { label: 'ALL', days: 'max' },
];

export const CoinPriceChart: React.FC<CoinPriceChartProps> = ({
  history,
  loading,
  selectedDays,
  onSelectDays,
}) => {
  const { currency } = useCrypto();

  const chartData = React.useMemo(() => {
    if (!history || !history.prices || history.prices.length === 0) return [];
    return history.prices.map(([timestamp, price]) => ({
      timestamp,
      price,
    }));
  }, [history]);

  const isPositiveTrend = React.useMemo(() => {
    if (chartData.length < 2) return true;
    const first = chartData[0].price;
    const last = chartData[chartData.length - 1].price;
    return last >= first;
  }, [chartData]);

  const strokeColor = isPositiveTrend ? '#10b981' : '#ef4444';
  const gradientId = `coin-chart-gradient-${isPositiveTrend ? 'green' : 'red'}`;

  // Calculate min and max for clean Y-axis padding
  const [minPrice, maxPrice] = React.useMemo(() => {
    if (chartData.length === 0) return [0, 0];
    const prices = chartData.map((d) => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const margin = (max - min) * 0.05 || min * 0.02;
    return [Math.max(0, min - margin), max + margin];
  }, [chartData]);

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur shadow-sm space-y-4">
      {/* Header with Timeframe selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Price Movement</h3>
          <p className="text-xs text-slate-400">
            Interactive chart with {TIMEFRAMES.find((t) => t.days === selectedDays)?.label || '7D'} history
          </p>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80 self-start sm:self-auto overflow-x-auto max-w-full">
          {TIMEFRAMES.map((tf) => {
            const isActive = selectedDays === tf.days;
            return (
              <button
                key={tf.days}
                onClick={() => onSelectDays(tf.days)}
                disabled={loading}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {tf.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 sm:h-80 w-full pt-4">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center">
            <Skeleton className="h-64 w-full" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">
            Historical chart data temporarily unavailable for this timeframe.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="timestamp"
                domain={['auto', 'auto']}
                tickFormatter={(val) => {
                  const d = new Date(val);
                  return selectedDays === '1'
                    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
                }}
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                minTickGap={40}
              />
              <YAxis
                domain={[minPrice, maxPrice]}
                orientation="right"
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => formatPrice(val, currency)}
                width={80}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-xl backdrop-blur text-xs space-y-1">
                        <div className="font-mono text-emerald-400 text-sm font-bold">
                          {formatPrice(item.price, currency)}
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          {formatDate(item.timestamp, true)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={strokeColor}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
