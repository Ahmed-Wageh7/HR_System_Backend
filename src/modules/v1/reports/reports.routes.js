import express from 'express';
import { auth } from '../../../middleware/auth.js';
import permit from '../../../middleware/rbac.js';
import { getPayrollReport, getAttendanceReport, getStaffHistory } from './reports.controller.js';

const router = express.Router();

router.use(auth, permit('reports:view'));
router.get('/payroll/:month', getPayrollReport);
router.get('/attendance/:month', getAttendanceReport);
router.get('/staff/:id/history', getStaffHistory);

export default router;
