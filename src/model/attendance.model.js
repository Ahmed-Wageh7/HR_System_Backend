import mongoose from 'mongoose';
import baseFields from './plugins/baseFields.js';

const attendanceSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    checkIn: Date,
    checkOut: Date,
    workingHours: {
      type: Number,
      default: 0
    },
    isLate: {
      type: Boolean,
      default: false
    },
    isAbsent: {
      type: Boolean,
      default: false
    },
    deductionAmount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

baseFields(attendanceSchema);
attendanceSchema.index({ staff: 1, date: -1 });
attendanceSchema.index({ date: 1 });

export default mongoose.model('Attendance', attendanceSchema);
