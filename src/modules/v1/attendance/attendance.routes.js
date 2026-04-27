import express from 'express';
import { auth } from '../../../middleware/auth.js';
import permit from '../../../middleware/rbac.js';
import { checkIn, checkOut } from './attendance.controller.js';

const router = express.Router();

router.use(auth);
router.post('/checkin', permit('attendance:write'), checkIn);
router.post('/checkout', permit('attendance:write'), checkOut);

export default router;
