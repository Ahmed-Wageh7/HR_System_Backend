import express from 'express';
import { auth } from '../../../middleware/auth.js';
import permit from '../../../middleware/rbac.js';
import {
  createRole,
  listRoles,
  updateRole,
  deleteRole,
  assignPermissions,
  removePermissions,
  assignRoleToUser
} from './roles.controller.js';

const router = express.Router();

router.use(auth, permit('roles:manage'));
router.post('/', createRole);
router.get('/', listRoles);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);
router.post('/:id/permissions', assignPermissions);
router.delete('/:id/permissions', removePermissions);
router.post('/users/:id/roles', assignRoleToUser);

export default router;
