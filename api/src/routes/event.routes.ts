import { Router } from 'express';
import {
  ingestEvent,
  getEvents,
  getEventById,
  getEventTypes,
} from '../controllers/event.controller';
import { validate } from '../middlewares/validate';
import { ingestEventSchema } from '../validators/schemas';

const router = Router();

router.post('/', validate(ingestEventSchema), ingestEvent);
router.get('/', getEvents);
router.get('/meta/types', getEventTypes);
router.get('/:id', getEventById);

export default router;
