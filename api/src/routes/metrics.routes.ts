import { Router } from 'express';
import { getMetrics } from '../controllers/metrics.controller';

const router = Router();

router.get('/', getMetrics as any);

export default router;



// This file:
// defines routes for metrics
// uses metrics controller
// requires authentication
