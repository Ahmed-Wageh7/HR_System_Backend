import express from 'express';
import { auth } from '../../../middleware/auth.js';
import permit from '../../../middleware/rbac.js';
import validate from '../../../middleware/validate.js';
import { listAllLeaves, reviewLeave } from './leave.controller.js';
import validation from './leave.validation.js';

const router = express.Router();

router.use(auth, permit('leave:approve'));
router.get('/', listAllLeaves);
router.patch('/:id/status', validate(validation.reviewLeaveSchema), reviewLeave);

export default router;
