import express from 'express';
import { auth } from '../../../middleware/auth.js';
import validate from '../../../middleware/validate.js';
import { uploadLimiter } from '../../../middleware/rateLimiter.js';
import upload from '../shared/upload.js';
import {
  getProfile,
  updateProfile,
  softDeleteProfile,
  uploadAvatar,
  deleteAvatar
} from './users.controller.js';
import validation from './users.validation.js';

const router = express.Router();

router.use(auth);
router.get('/profile', getProfile);
router.put('/profile', validate(validation.profileSchema), updateProfile);
router.delete('/profile', softDeleteProfile);
router.post('/upload-avatar', uploadLimiter, upload.single('avatar'), uploadAvatar);
router.delete('/avatar', deleteAvatar);

export default router;
