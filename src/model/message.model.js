import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['announcement', 'payroll', 'warning'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    targetRole: {
      type: String,
      enum: ['all', 'staff', 'admin'],
      default: 'all'
    },
    expiresAt: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

export default mongoose.model('Message', messageSchema);
