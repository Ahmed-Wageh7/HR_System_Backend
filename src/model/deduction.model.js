import mongoose from 'mongoose';
import baseFields from './plugins/baseFields.js';

const deductionSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: true
    },
    month: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    reason: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

baseFields(deductionSchema);
deductionSchema.index({ staff: 1, month: 1 });

export default mongoose.model('Deduction', deductionSchema);
