import express from 'express';
import { auth } from '../../../middleware/auth.js';
import permit from '../../../middleware/rbac.js';
import {
  createDepartment,
  listDepartments,
  updateDepartment,
  deleteDepartment,
  restoreDepartment
} from './departments.controller.js';

const router = express.Router();

router.use(auth, permit('department:manage'));
router.post('/', createDepartment);
router.get('/', listDepartments);
router.put('/:id', updateDepartment);
router.delete('/:id', deleteDepartment);
router.patch('/:id/restore', restoreDepartment);

export default router;
