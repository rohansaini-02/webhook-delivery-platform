import { Router } from 'express';
import {
  getDeliveries,
  getDeliveryById,
  getDlqDeliveries,
} from '../controllers/delivery.controller';

const router = Router();

router.get('/', getDeliveries);
router.get('/dlq', getDlqDeliveries);
router.get('/:id', getDeliveryById);

export default router;
