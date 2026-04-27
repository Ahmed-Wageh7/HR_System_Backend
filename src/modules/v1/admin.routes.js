import express from 'express';

import staffRouter from './staff/staff.routes.js';
import roleRouter from './roles/roles.routes.js';
import auditRouter from './audit/audit.routes.js';
import departmentRouter from './departments/departments.routes.js';
import reportRouter from './reports/reports.routes.js';
import adminLeaveRouter from './leave/admin-leave.routes.js';
import adminUsersRouter from './users/admin-users.routes.js';
import adminTicketsRouter from './tickets/admin-tickets.routes.js';

const router = express.Router();

router.use('/staff', staffRouter);
router.use('/roles', roleRouter);
router.use('/audit-logs', auditRouter);
router.use('/departments', departmentRouter);
router.use('/reports', reportRouter);
router.use('/leaves', adminLeaveRouter);
router.use('/users', adminUsersRouter);
router.use('/tickets', adminTicketsRouter);

export default router;
