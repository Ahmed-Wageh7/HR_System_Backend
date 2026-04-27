import mongoose from 'mongoose';
import baseFields from './plugins/baseFields.js';

const leaveSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: true
    },
    type: {
      type: String,
      default: 'annual'
    },
    reason: String,
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    days: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    reviewNote: String
  },
  { timestamps: true }
);

baseFields(leaveSchema);
leaveSchema.index({ staff: 1, status: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.model('Leave', leaveSchema);
