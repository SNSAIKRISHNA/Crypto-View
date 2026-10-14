import { Router } from 'express';
import { marketController } from '../controllers/marketController.js';

const router = Router();

router.get('/', (req, res, next) => marketController.getMarkets(req, res, next));
router.get('/global', (req, res, next) => marketController.getGlobal(req, res, next));
router.get('/trending', (req, res, next) => marketController.getTrending(req, res, next));
router.get('/gainers', (req, res, next) => marketController.getGainers(req, res, next));
router.get('/losers', (req, res, next) => marketController.getLosers(req, res, next));

export default router;
