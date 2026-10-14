import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Globe,
  ExternalLink,
  ChevronLeft,
  Share2,
  TrendingUp,
  TrendingDown,
  Info,
  Copy,
  Check,
} from 'lucide-react';
import { useCrypto } from '../store/useCryptoStore';
import { api } from '../services/api';
import { CoinDetail, MarketChartHistory } from '../types/crypto';
import {
  formatPrice,
  formatCompactNumber,
  formatPercentage,
  formatSupply,
  formatDate,
} from '../utils/formatters';
import { CoinPriceChart } from '../components/coin/CoinPriceChart';
import { Skeleton } from '../components/common/SkeletonLoader';

export const CoinDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const coinId = id || 'bitcoin';

  const {
    currency,
    liveTicks,
    priceFlashes,
    isInWatchlist,
    toggleWatchlist,
    addRecentlyViewed,
  } = useCrypto();

  const [coin, setCoin] = useState<CoinDetail | null>(null);
  const [history, setHistory] = useState<MarketChartHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState('7');
  const [error, setError] = useState<string | null>(null);
  const [copiedContract, setCopiedContract] = useState(false);

  // Load coin details
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchDetail = async () => {
      try {
        const data = await api.getCoinDetail(coinId);
        if (isMounted) {
          setCoin(data);
          addRecentlyViewed(coinId);
          // Update SEO document title
          document.title = `${data.name} (${data.symbol.toUpperCase()}) Price & Chart | Crypto-View`;
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || `Failed to load details for ${coinId}`);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetail();

    return () => {
      isMounted = false;
      document.title = 'Crypto-View — Real-Time Cryptocurrency Market Dashboard';
    };
  }, [coinId, addRecentlyViewed]);

  // Load coin history chart data
  useEffect(() => {
    let isMounted = true;
    setChartLoading(true);

    const fetchHistory = async () => {
      try {
        const histData = await api.getCoinHistory(coinId, currency, selectedDays);
        if (isMounted) {
          setHistory(histData);
        }
      } catch (err) {
        console.warn('Failed to load chart history:', err);
      } finally {
        if (isMounted) setChartLoading(false);
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, [coinId, currency, selectedDays]);

  const handleCopyContract = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-16">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !coin) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto">
        <div className="text-rose-400 font-semibold">{error || 'Coin not found.'}</div>
        <Link
          to="/markets"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-sm hover:bg-slate-700 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Markets</span>
        </Link>
      </div>
    );
  }

  // Real-time tick overrides
  const liveTick = liveTicks[coin.id] || liveTicks[coin.symbol.toLowerCase()];
  const currentPrice = liveTick
    ? liveTick.priceUsd
    : coin.market_data.current_price[currency] || coin.market_data.current_price['usd'] || 0;
  const change24h = liveTick
    ? liveTick.priceChangePercent24h
    : coin.market_data.price_change_percentage_24h || 0;
  const changeFmt = formatPercentage(change24h);
  const flash = priceFlashes[coin.id] || priceFlashes[coin.symbol.toLowerCase()];

  const isStarred = isInWatchlist(coin.id);

  // Statistics
  const marketCap = coin.market_data.market_cap[currency] || coin.market_data.market_cap['usd'];
  const fdv =
    coin.market_data.fully_diluted_valuation?.[currency] ||
    coin.market_data.fully_diluted_valuation?.['usd'];
  const volume24h =
    coin.market_data.total_volume[currency] || coin.market_data.total_volume['usd'];
  const high24h = liveTick?.high24h || coin.market_data.high_24h[currency] || coin.market_data.high_24h['usd'];
  const low24h = liveTick?.low24h || coin.market_data.low_24h[currency] || coin.market_data.low_24h['usd'];

  const ath = coin.market_data.ath[currency] || coin.market_data.ath['usd'];
  const athChange =
    coin.market_data.ath_change_percentage[currency] ||
    coin.market_data.ath_change_percentage['usd'];
  const athDate =
    coin.market_data.ath_date[currency] || coin.market_data.ath_date['usd'];

  const atl = coin.market_data.atl[currency] || coin.market_data.atl['usd'];
  const atlChange =
    coin.market_data.atl_change_percentage[currency] ||
    coin.market_data.atl_change_percentage['usd'];
  const atlDate =
    coin.market_data.atl_date[currency] || coin.market_data.atl_date['usd'];

  // Smart Contract Addresses
  const platforms = coin.detail_platforms || {};
  const primaryPlatformKey = Object.keys(platforms).find(
    (k) => platforms[k]?.contract_address && platforms[k].contract_address.length > 0
  );
  const contractAddress = primaryPlatformKey ? platforms[primaryPlatformKey].contract_address : null;

  return (
    <div className="space-y-8 pb-16">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/markets"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Markets</span>
          <span className="text-slate-600">/</span>
          <span className="text-white">{coin.name}</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleWatchlist(coin.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
              isStarred
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-amber-400' : ''}`} />
            <span>{isStarred ? 'Watchlisted' : 'Add to Watchlist'}</span>
          </button>
        </div>
      </div>

      {/* Coin Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur shadow-sm">
        {/* Left: Identity */}
        <div className="flex items-center gap-4">
          <img
            src={coin.image.large}
            alt={coin.name}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-800 p-1 shadow-md shrink-0"
          />
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {coin.name}
              </h1>
              <span className="text-xs uppercase font-bold text-slate-400 bg-slate-800 border border-slate-700/60 px-2 py-0.5 rounded-md">
                {coin.symbol}
              </span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                Rank #{coin.market_cap_rank}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Live spot price on global cryptocurrency exchanges
            </p>
          </div>
        </div>

        {/* Right: Live Price and 24h change */}
        <div className="flex flex-col sm:items-end">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Current Price
          </div>
          <div className="flex items-baseline gap-3 mt-1">
            <span
              className={`text-3xl sm:text-4xl font-black font-mono tracking-tight text-white transition-all duration-300 ${
                flash === 'up'
                  ? 'text-emerald-400'
                  : flash === 'down'
                  ? 'text-rose-400'
                  : ''
              }`}
            >
              {formatPrice(currentPrice, currency)}
            </span>
            <div
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs sm:text-sm font-bold ${
                changeFmt.isPositive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
              }`}
            >
              {changeFmt.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>{changeFmt.text}</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            24h Range: {formatPrice(low24h, currency)} — {formatPrice(high24h, currency)}
          </div>
        </div>
      </div>

      {/* Interactive Price Movement Chart */}
      <CoinPriceChart
        history={history}
        loading={chartLoading}
        selectedDays={selectedDays}
        onSelectDays={setSelectedDays}
        coinName={coin.name}
      />

      {/* Key Market Statistics Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">Market Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Market Cap */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80">
            <div className="text-xs font-semibold text-slate-400 uppercase">Market Capitalization</div>
            <div className="text-xl font-bold font-mono text-white mt-1.5">
              {formatCompactNumber(marketCap, currency)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Rank #{coin.market_cap_rank}
            </div>
          </div>

          {/* 24h Trading Volume */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80">
            <div className="text-xs font-semibold text-slate-400 uppercase">24h Trading Volume</div>
            <div className="text-xl font-bold font-mono text-white mt-1.5">
              {formatCompactNumber(volume24h, currency)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Global exchange liquidity
            </div>
          </div>

          {/* Circulating Supply */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80">
            <div className="text-xs font-semibold text-slate-400 uppercase">Circulating Supply</div>
            <div className="text-xl font-bold font-mono text-white mt-1.5">
              {formatSupply(coin.market_data.circulating_supply, coin.symbol)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {coin.market_data.max_supply
                ? `${((coin.market_data.circulating_supply / coin.market_data.max_supply) * 100).toFixed(1)}% of max supply`
                : 'No fixed maximum'}
            </div>
          </div>

          {/* Fully Diluted Valuation */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80">
            <div className="text-xs font-semibold text-slate-400 uppercase">Fully Diluted Valuation</div>
            <div className="text-xl font-bold font-mono text-white mt-1.5">
              {fdv ? formatCompactNumber(fdv, currency) : '—'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Max market capitalization
            </div>
          </div>

          {/* All-Time High */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80">
            <div className="text-xs font-semibold text-slate-400 uppercase">All-Time High (ATH)</div>
            <div className="text-xl font-bold font-mono text-white mt-1.5">
              {formatPrice(ath, currency)}
            </div>
            <div className="text-[11px] text-rose-400 font-medium mt-0.5">
              {athChange ? `${athChange.toFixed(2)}%` : '—'} ({formatDate(athDate)})
            </div>
          </div>

          {/* All-Time Low */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80">
            <div className="text-xs font-semibold text-slate-400 uppercase">All-Time Low (ATL)</div>
            <div className="text-xl font-bold font-mono text-white mt-1.5">
              {formatPrice(atl, currency)}
            </div>
            <div className="text-[11px] text-emerald-400 font-medium mt-0.5">
              {atlChange ? `+${atlChange.toFixed(2)}%` : '—'} ({formatDate(atlDate)})
            </div>
          </div>

          {/* Total Supply */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80">
            <div className="text-xs font-semibold text-slate-400 uppercase">Total Supply</div>
            <div className="text-xl font-bold font-mono text-white mt-1.5">
              {formatSupply(coin.market_data.total_supply, coin.symbol)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Coins currently minted
            </div>
          </div>

          {/* Max Supply */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80">
            <div className="text-xs font-semibold text-slate-400 uppercase">Max Supply</div>
            <div className="text-xl font-bold font-mono text-white mt-1.5">
              {coin.market_data.max_supply ? formatSupply(coin.market_data.max_supply, coin.symbol) : '∞ Infinite'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Hardcoded protocol cap
            </div>
          </div>
        </div>
      </div>

      {/* Contract Address (if token) */}
      {contractAddress && (
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-300">
              Contract Address ({primaryPlatformKey}):
            </span>
            <span className="text-xs font-mono text-slate-400 truncate max-w-xs sm:max-w-md">
              {contractAddress}
            </span>
          </div>

          <button
            onClick={() => handleCopyContract(contractAddress)}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-200 transition"
          >
            {copiedContract ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Additional Information: Description and Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Description */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-3">
          <h2 className="text-base font-bold text-white tracking-tight">About {coin.name}</h2>
          {coin.description?.en ? (
            <div
              className="text-sm text-slate-300 leading-relaxed space-y-3 prose prose-invert prose-emerald max-w-none max-h-72 overflow-y-auto pr-2"
              dangerouslySetInnerHTML={{
                __html: coin.description.en.split('\r\n\r\n')[0] || coin.description.en,
              }}
            />
          ) : (
            <p className="text-sm text-slate-400">
              No description provided by the market data repository.
            </p>
          )}
        </div>

        {/* Official Links */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-4">
          <h2 className="text-base font-bold text-white tracking-tight">Resources & Links</h2>
          <div className="space-y-2 text-xs">
            {coin.links.homepage?.[0] && (
              <a
                href={coin.links.homepage[0]}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 transition"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span>Official Website</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
            )}

            {coin.links.blockchain_site?.[0] && (
              <a
                href={coin.links.blockchain_site[0]}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 transition"
              >
                <span>Blockchain Explorer</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
            )}

            {coin.links.subreddit_url && (
              <a
                href={coin.links.subreddit_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 transition"
              >
                <span>Reddit Community</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
            )}

            {coin.links.repos_url?.github?.[0] && (
              <a
                href={coin.links.repos_url.github[0]}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 transition"
              >
                <span>Source Code (GitHub)</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
