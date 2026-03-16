import { Router } from 'express';
import {
  ingestEvent,
  getEvents,
  getEventById,
} from '../controllers/event.controller';

const router = Router();

router.post('/', ingestEvent);
router.get('/', getEvents);
router.get('/:id', getEventById);

export default router;
