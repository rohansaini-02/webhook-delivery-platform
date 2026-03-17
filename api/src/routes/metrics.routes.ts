import { Router } from 'express';
import { getMetrics } from '../controllers/metrics.controller';

const router = Router();

router.get('/', getMetrics as any);

export default router;
