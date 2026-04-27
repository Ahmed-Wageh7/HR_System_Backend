import express from 'express';
import { auth } from '../../../middleware/auth.js';
import permit from '../../../middleware/rbac.js';
import { listLogs, listByUser, listByResource } from './audit.controller.js';

const router = express.Router();

router.use(auth, permit('audit:read'));
router.get('/', listLogs);
router.get('/user/:userId', listByUser);
router.get('/resource/:resource', listByResource);

export default router;
