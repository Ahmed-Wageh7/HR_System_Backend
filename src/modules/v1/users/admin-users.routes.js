import express from 'express';
import { auth } from '../../../middleware/auth.js';
import permit from '../../../middleware/rbac.js';
import { restoreUser } from './admin-users.controller.js';

const router = express.Router();

router.use(auth, permit('users:manage'));
router.patch('/:id/restore', restoreUser);

export default router;
