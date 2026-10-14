import { Request, Response, NextFunction } from 'express';
import { coinService } from '../services/crypto/coinService.js';

export class CoinController {
  public async getCoinDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, error: { message: 'Coin ID is required' } });
        return;
      }

      const coin = await coinService.getCoinDetail(id);
      res.json({
        success: true,
        data: coin,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getCoinHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const currency = (req.query.vs_currency as string) || 'usd';
      const days = (req.query.days as string) || '7';

      if (!id) {
        res.status(400).json({ success: false, error: { message: 'Coin ID is required' } });
        return;
      }

      const history = await coinService.getCoinHistory(id, currency, days);
      res.json({
        success: true,
        data: history,
        meta: { id, currency, days },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const coinController = new CoinController();
