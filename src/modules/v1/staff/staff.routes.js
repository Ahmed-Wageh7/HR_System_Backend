import express from 'express';
import { auth } from '../../../middleware/auth.js';
import permit from '../../../middleware/rbac.js';
import validate from '../../../middleware/validate.js';
import upload from '../shared/upload.js';
import { bulkLimiter, uploadLimiter } from '../../../middleware/rateLimiter.js';
import {
  createStaff,
  listStaff,
  getStaff,
  updateStaff,
  deleteStaff,
  restoreStaff,
  getAttendance,
  getMonthlyAttendanceSummary,
  addDeduction,
  listDeductions,
  updateDeduction,
  deleteDeduction,
  calculateSalary,
  paySalary,
  adjustSalary,
  bulkPaySalary,
  uploadDocument,
  deleteDocument
} from './staff.controller.js';
import validation from './staff.validation.js';

const router = express.Router();

router.use(auth);

router.post('/', permit('staff:create'), validate(validation.createStaffSchema), createStaff);
router.get('/', permit('staff:read'), listStaff);
router.get('/:id', permit('staff:read'), getStaff);
router.put('/:id', permit('staff:update'), validate(validation.updateStaffSchema), updateStaff);
router.delete('/:id', permit('staff:delete'), deleteStaff);
router.patch('/:id/restore', permit('staff:update'), restoreStaff);

router.get('/:id/attendance', permit('attendance:read'), getAttendance);
router.get('/:id/attendance/:month', permit('attendance:read'), getMonthlyAttendanceSummary);

router.post('/:id/deductions', permit('salary:adjust'), validate(validation.deductionSchema), addDeduction);
router.get('/:id/deductions', permit('salary:read'), listDeductions);
router.put('/:id/deductions/:did', permit('salary:adjust'), validate(validation.deductionSchema), updateDeduction);
router.delete('/:id/deductions/:did', permit('salary:adjust'), deleteDeduction);

router.get('/:id/salary/:month', permit('salary:read'), calculateSalary);
router.post('/:id/salary/:month/pay', permit('salary:pay'), paySalary);
router.put('/:id/salary/:month/adjust', permit('salary:adjust'), validate(validation.salaryAdjustSchema), adjustSalary);
router.post('/salary/:month/bulk-pay', permit('salary:pay'), bulkLimiter, bulkPaySalary);

router.post('/:id/documents', permit('staff:update'), uploadLimiter, upload.single('document'), uploadDocument);
router.delete('/:id/documents/:docId', permit('staff:update'), deleteDocument);

export default router;
