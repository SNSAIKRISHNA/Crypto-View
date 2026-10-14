import axios, { AxiosInstance } from 'axios';
import { ENV } from '../../config/env.js';
import { cacheService } from './cacheService.js';
import {
  CryptoMarketItem,
  GlobalMarketData,
  CoinDetail,
  MarketChartHistory,
  SearchResultItem,
} from '../../types/crypto.js';

export interface ICryptoProvider {
  getMarkets(
    currency?: string,
    page?: number,
    perPage?: number,
    order?: string,
    sparkline?: boolean
  ): Promise<CryptoMarketItem[]>;
  getGlobal(): Promise<GlobalMarketData>;
  getTrending(): Promise<any>;
  getCoinDetail(id: string): Promise<CoinDetail>;
  getCoinHistory(id: string, currency?: string, days?: string): Promise<MarketChartHistory>;
  search(query: string): Promise<SearchResultItem[]>;
}

export class CoinGeckoProvider implements ICryptoProvider {
  private client: AxiosInstance;

  constructor() {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'User-Agent': 'CryptoView/1.0',
    };

    if (ENV.COINGECKO_API_KEY) {
      if (ENV.COINGECKO_BASE_URL.includes('pro-api')) {
        headers['x-cg-pro-api-key'] = ENV.COINGECKO_API_KEY;
      } else {
        headers['x-cg-demo-api-key'] = ENV.COINGECKO_API_KEY;
      }
    }

    this.client = axios.create({
      baseURL: ENV.COINGECKO_BASE_URL,
      timeout: 10000,
      headers,
    });
  }

  public async getMarkets(
    currency = 'usd',
    page = 1,
    perPage = 100,
    order = 'market_cap_desc',
    sparkline = true
  ): Promise<CryptoMarketItem[]> {
    const cacheKey = `markets_${currency}_${page}_${perPage}_${order}_${sparkline}`;
    const cached = cacheService.get<CryptoMarketItem[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.get('/coins/markets', {
        params: {
          vs_currency: currency.toLowerCase(),
          order,
          per_page: perPage,
          page,
          sparkline,
          price_change_percentage: '1h,24h,7d',
        },
      });

      const data: CryptoMarketItem[] = response.data;
      cacheService.set(cacheKey, data, ENV.CACHE_TTL_MARKETS);
      return data;
    } catch (error: any) {
      console.warn(`[CoinGeckoProvider] Markets fetch warning: ${error.message}`);
      const stale = cacheService.getStale<CryptoMarketItem[]>(cacheKey);
      if (stale) {
        console.log(`[CoinGeckoProvider] Serving stale markets data from cache (${new Date(stale.cachedAt).toISOString()})`);
        return stale.data;
      }
      throw error;
    }
  }

  public async getGlobal(): Promise<GlobalMarketData> {
    const cacheKey = 'global_market_data';
    const cached = cacheService.get<GlobalMarketData>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.get('/global');
      const data: GlobalMarketData = response.data.data;
      cacheService.set(cacheKey, data, ENV.CACHE_TTL_GLOBAL);
      return data;
    } catch (error: any) {
      console.warn(`[CoinGeckoProvider] Global fetch warning: ${error.message}`);
      const stale = cacheService.getStale<GlobalMarketData>(cacheKey);
      if (stale) {
        console.log('[CoinGeckoProvider] Serving stale global data');
        return stale.data;
      }
      throw error;
    }
  }

  public async getTrending(): Promise<any> {
    const cacheKey = 'trending_data';
    const cached = cacheService.get<any>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.get('/search/trending');
      const data = response.data;
      cacheService.set(cacheKey, data, ENV.CACHE_TTL_MARKETS);
      return data;
    } catch (error: any) {
      console.warn(`[CoinGeckoProvider] Trending fetch warning: ${error.message}`);
      const stale = cacheService.getStale<any>(cacheKey);
      if (stale) return stale.data;
      throw error;
    }
  }

  public async getCoinDetail(id: string): Promise<CoinDetail> {
    const sanitizedId = encodeURIComponent(id.toLowerCase());
    const cacheKey = `coin_detail_${sanitizedId}`;
    const cached = cacheService.get<CoinDetail>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.get(`/coins/${sanitizedId}`, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: true,
          developer_data: false,
          sparkline: false,
        },
      });

      const data: CoinDetail = response.data;
      cacheService.set(cacheKey, data, ENV.CACHE_TTL_COIN_DETAIL);
      return data;
    } catch (error: any) {
      console.warn(`[CoinGeckoProvider] Coin detail warning (${id}): ${error.message}`);
      const stale = cacheService.getStale<CoinDetail>(cacheKey);
      if (stale) return stale.data;
      throw error;
    }
  }

  public async getCoinHistory(
    id: string,
    currency = 'usd',
    days = '7'
  ): Promise<MarketChartHistory> {
    const sanitizedId = encodeURIComponent(id.toLowerCase());
    const cacheKey = `coin_history_${sanitizedId}_${currency}_${days}`;
    const cached = cacheService.get<MarketChartHistory>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.get(`/coins/${sanitizedId}/market_chart`, {
        params: {
          vs_currency: currency.toLowerCase(),
          days,
        },
      });

      const data: MarketChartHistory = response.data;
      cacheService.set(cacheKey, data, ENV.CACHE_TTL_HISTORY);
      return data;
    } catch (error: any) {
      console.warn(`[CoinGeckoProvider] Coin history warning (${id}): ${error.message}`);
      const stale = cacheService.getStale<MarketChartHistory>(cacheKey);
      if (stale) return stale.data;
      throw error;
    }
  }

  public async search(query: string): Promise<SearchResultItem[]> {
    if (!query || query.trim().length === 0) return [];
    const sanitizedQuery = encodeURIComponent(query.trim().toLowerCase());
    const cacheKey = `search_${sanitizedQuery}`;
    const cached = cacheService.get<SearchResultItem[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.get('/search', {
        params: { query: query.trim() },
      });

      const coins: SearchResultItem[] = (response.data.coins || []).slice(0, 15);
      cacheService.set(cacheKey, coins, 180); // cache search for 3 mins
      return coins;
    } catch (error: any) {
      console.warn(`[CoinGeckoProvider] Search warning (${query}): ${error.message}`);
      const stale = cacheService.getStale<SearchResultItem[]>(cacheKey);
      if (stale) return stale.data;
      throw error;
    }
  }
}

export const defaultCryptoProvider = new CoinGeckoProvider();
