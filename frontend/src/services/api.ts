import {
  CryptoMarketItem,
  GlobalMarketData,
  CoinDetail,
  MarketChartHistory,
  SearchResultItem,
  CurrencyCode,
} from '../types/crypto';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    let errorMsg = `Server error: ${response.status} ${response.statusText}`;
    try {
      const errData = await response.json();
      if (errData?.error?.message) {
        errorMsg = errData.error.message;
      }
    } catch {}
    throw new Error(errorMsg);
  }
  const result = await response.json();
  return result.data !== undefined ? result.data : result;
}

export const api = {
  async getMarkets(
    currency: CurrencyCode = 'usd',
    page = 1,
    perPage = 100,
    order = 'market_cap_desc',
    sparkline = true
  ): Promise<CryptoMarketItem[]> {
    const url = `${API_BASE_URL}/markets?vs_currency=${currency}&page=${page}&per_page=${perPage}&order=${order}&sparkline=${sparkline}`;
    return fetchJson<CryptoMarketItem[]>(url);
  },

  async getGlobal(): Promise<GlobalMarketData> {
    return fetchJson<GlobalMarketData>(`${API_BASE_URL}/global`);
  },

  async getTrending(): Promise<any> {
    return fetchJson<any>(`${API_BASE_URL}/markets/trending`);
  },

  async getGainers(currency: CurrencyCode = 'usd', limit = 10): Promise<CryptoMarketItem[]> {
    return fetchJson<CryptoMarketItem[]>(
      `${API_BASE_URL}/markets/gainers?vs_currency=${currency}&limit=${limit}`
    );
  },

  async getLosers(currency: CurrencyCode = 'usd', limit = 10): Promise<CryptoMarketItem[]> {
    return fetchJson<CryptoMarketItem[]>(
      `${API_BASE_URL}/markets/losers?vs_currency=${currency}&limit=${limit}`
    );
  },

  async getCoinDetail(id: string): Promise<CoinDetail> {
    return fetchJson<CoinDetail>(`${API_BASE_URL}/coin/${encodeURIComponent(id)}`);
  },

  async getCoinHistory(
    id: string,
    currency: CurrencyCode = 'usd',
    days = '7'
  ): Promise<MarketChartHistory> {
    return fetchJson<MarketChartHistory>(
      `${API_BASE_URL}/coin/${encodeURIComponent(id)}/history?vs_currency=${currency}&days=${days}`
    );
  },

  async search(query: string): Promise<SearchResultItem[]> {
    if (!query.trim()) return [];
    return fetchJson<SearchResultItem[]>(
      `${API_BASE_URL}/search?q=${encodeURIComponent(query.trim())}`
    );
  },
};
