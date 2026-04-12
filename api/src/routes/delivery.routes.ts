import { Router } from 'express';
import {
  getDeliveries,
  getDeliveryById,
  getDlqDeliveries,
  purgeDlq,
  replayAllDlq,
  replayDelivery
} from '../controllers/delivery.controller';

const router = Router();

router.get('/', getDeliveries);
router.get('/dlq', getDlqDeliveries);
router.post('/dlq/purge', purgeDlq);
router.post('/dlq/replay-all', replayAllDlq);
router.get('/:id', getDeliveryById);
router.post('/:id/replay', replayDelivery);

export default router;
