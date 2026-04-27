import express from 'express';
import { auth } from '../../../middleware/auth.js';
import permit from '../../../middleware/rbac.js';
import validate from '../../../middleware/validate.js';
import { createLeave, listMyLeaves, getLeave, cancelLeave } from './leave.controller.js';
import validation from './leave.validation.js';

const router = express.Router();

router.use(auth);

router.post('/', permit('leave:create'), validate(validation.createLeaveSchema), createLeave);
router.get('/', permit('leave:read'), listMyLeaves);
router.get('/:id', permit('leave:read'), getLeave);
router.delete('/:id', permit('leave:create'), cancelLeave);

export default router;
