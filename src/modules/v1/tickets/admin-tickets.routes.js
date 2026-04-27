import express from 'express';
import { auth } from '../../../middleware/auth.js';
import permit from '../../../middleware/rbac.js';
import { updateStatus } from './tickets.controller.js';

const router = express.Router();

router.use(auth, permit('tickets:manage'));
router.patch('/:id/status', updateStatus);

export default router;
