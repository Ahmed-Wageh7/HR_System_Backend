import mongoose from 'mongoose';
import baseFields from './plugins/baseFields.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    phone: String,
    avatar: {
      url: String,
      publicId: String,
      path: String
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role'
    },
    permissions: {
      type: [String],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
  },
  { timestamps: true }
);

baseFields(userSchema);
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ isDeleted: 1 });

export default mongoose.model('User', userSchema);
