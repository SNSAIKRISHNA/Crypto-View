import { Router } from 'express';
import { coinController } from '../controllers/coinController.js';

const router = Router();

router.get('/:id', (req, res, next) => coinController.getCoinDetail(req, res, next));
router.get('/:id/history', (req, res, next) => coinController.getCoinHistory(req, res, next));

export default router;
