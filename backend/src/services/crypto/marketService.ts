import { defaultCryptoProvider, ICryptoProvider } from './cryptoProvider.js';
import { CryptoMarketItem, GlobalMarketData } from '../../types/crypto.js';

export class MarketService {
  private provider: ICryptoProvider;

  constructor(provider: ICryptoProvider = defaultCryptoProvider) {
    this.provider = provider;
  }

  public async getMarkets(
    currency = 'usd',
    page = 1,
    perPage = 100,
    order = 'market_cap_desc',
    sparkline = true
  ): Promise<CryptoMarketItem[]> {
    return this.provider.getMarkets(currency, page, perPage, order, sparkline);
  }

  public async getGlobal(): Promise<GlobalMarketData> {
    return this.provider.getGlobal();
  }

  public async getTrending(): Promise<any> {
    return this.provider.getTrending();
  }

  public async getGainers(currency = 'usd', limit = 10): Promise<CryptoMarketItem[]> {
    const markets = await this.getMarkets(currency, 1, 100, 'market_cap_desc', false);
    return [...markets]
      .filter((coin) => (coin.price_change_percentage_24h ?? 0) > 0)
      .sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0))
      .slice(0, limit);
  }

  public async getLosers(currency = 'usd', limit = 10): Promise<CryptoMarketItem[]> {
    const markets = await this.getMarkets(currency, 1, 100, 'market_cap_desc', false);
    return [...markets]
      .filter((coin) => (coin.price_change_percentage_24h ?? 0) < 0)
      .sort((a, b) => (a.price_change_percentage_24h ?? 0) - (b.price_change_percentage_24h ?? 0))
      .slice(0, limit);
  }
}

export const marketService = new MarketService();
