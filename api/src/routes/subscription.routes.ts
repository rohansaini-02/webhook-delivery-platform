import { Router } from 'express';
import {
  getSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  rotateSecret,
} from '../controllers/subscription.controller';

const router = Router();

router.get('/', getSubscriptions);
router.get('/:id', getSubscriptionById);
router.post('/', createSubscription);
router.patch('/:id', updateSubscription);
router.delete('/:id', deleteSubscription);
router.post('/:id/rotate-secret', rotateSecret);

export default router;
