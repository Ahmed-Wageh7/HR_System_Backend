import express from 'express';
import { auth } from '../../../middleware/auth.js';
import { createTicket, listMyTickets, getTicket, replyTicket } from './tickets.controller.js';

const router = express.Router();

router.use(auth);
router.post('/', createTicket);
router.get('/', listMyTickets);
router.get('/:id', getTicket);
router.post('/:id/reply', replyTicket);

export default router;
