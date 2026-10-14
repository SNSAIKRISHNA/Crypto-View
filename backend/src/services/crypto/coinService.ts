import { defaultCryptoProvider, ICryptoProvider } from './cryptoProvider.js';
import { CoinDetail, MarketChartHistory, SearchResultItem } from '../../types/crypto.js';

export class CoinService {
  private provider: ICryptoProvider;

  constructor(provider: ICryptoProvider = defaultCryptoProvider) {
    this.provider = provider;
  }

  public async getCoinDetail(id: string): Promise<CoinDetail> {
    return this.provider.getCoinDetail(id);
  }

  public async getCoinHistory(
    id: string,
    currency = 'usd',
    days = '7'
  ): Promise<MarketChartHistory> {
    return this.provider.getCoinHistory(id, currency, days);
  }

  public async search(query: string): Promise<SearchResultItem[]> {
    return this.provider.search(query);
  }
}

export const coinService = new CoinService();
