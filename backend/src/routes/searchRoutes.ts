import { Router } from 'express';
import { searchController } from '../controllers/searchController.js';
import { searchRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/', searchRateLimiter, (req, res, next) => searchController.search(req, res, next));

export default router;
