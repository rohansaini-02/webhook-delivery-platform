import { Router } from 'express';
import {
  getSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  rotateSecret,
} from '../controllers/subscription.controller';
import { validate } from '../middlewares/validate';
import { createSubscriptionSchema, updateSubscriptionSchema } from '../validators/schemas';

const router = Router();

router.get('/', getSubscriptions);
router.get('/:id', getSubscriptionById);
router.post('/', validate(createSubscriptionSchema), createSubscription);
router.patch('/:id', validate(updateSubscriptionSchema), updateSubscription);
router.delete('/:id', deleteSubscription);
router.post('/:id/rotate-secret', rotateSecret);

export default router;
