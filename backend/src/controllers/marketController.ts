import { Request, Response, NextFunction } from 'express';
import { marketService } from '../services/crypto/marketService.js';

export class MarketController {
  public async getMarkets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currency = (req.query.vs_currency as string) || 'usd';
      const page = parseInt((req.query.page as string) || '1', 10);
      const perPage = parseInt((req.query.per_page as string) || '100', 10);
      const order = (req.query.order as string) || 'market_cap_desc';
      const sparkline = req.query.sparkline !== 'false';

      const markets = await marketService.getMarkets(currency, page, perPage, order, sparkline);
      res.json({
        success: true,
        data: markets,
        meta: { currency, page, perPage, total: markets.length },
      });
    } catch (error) {
      next(error);
    }
  }

  public async getGlobal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const globalData = await marketService.getGlobal();
      res.json({
        success: true,
        data: globalData,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getTrending(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const trending = await marketService.getTrending();
      res.json({
        success: true,
        data: trending,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getGainers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currency = (req.query.vs_currency as string) || 'usd';
      const limit = parseInt((req.query.limit as string) || '10', 10);
      const gainers = await marketService.getGainers(currency, limit);
      res.json({
        success: true,
        data: gainers,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getLosers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currency = (req.query.vs_currency as string) || 'usd';
      const limit = parseInt((req.query.limit as string) || '10', 10);
      const losers = await marketService.getLosers(currency, limit);
      res.json({
        success: true,
        data: losers,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const marketController = new MarketController();
