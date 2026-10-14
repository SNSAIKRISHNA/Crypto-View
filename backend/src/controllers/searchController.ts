import { Request, Response, NextFunction } from 'express';
import { coinService } from '../services/crypto/coinService.js';

export class SearchController {
  public async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = (req.query.q as string) || '';
      if (!query.trim()) {
        res.json({ success: true, data: [] });
        return;
      }

      const results = await coinService.search(query);
      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const searchController = new SearchController();
