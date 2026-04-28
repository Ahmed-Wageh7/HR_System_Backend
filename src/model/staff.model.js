import mongoose from 'mongoose';
import baseFields from './plugins/baseFields.js';

const monthlyReportSchema = new mongoose.Schema(
  {
    month: String,
    totalDaysWorked: Number,
    lateDays: Number,
    absentDays: Number,
    totalDeductions: Number,
    adjustments: Number,
    finalSalary: Number,
    isPaid: Boolean,
    paidAt: Date
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    name: String,
    url: String,
    publicId: String,
    path: String,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const staffSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    employeeCode: {
      type: String
    },
    dailySalary: {
      type: Number,
      required: true,
      min: 0
    },
    joinDate: Date,
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    position: String,
    isActive: {
      type: Boolean,
      default: true
    },
    annualLeaveBalance: {
      type: Number,
      default: 21
    },
    documents: [documentSchema],
    monthlyReports: [monthlyReportSchema]
  },
  { timestamps: true }
);

baseFields(staffSchema);
staffSchema.index({ employeeCode: 1 }, { unique: true });
staffSchema.index({ department: 1 });
staffSchema.index({ isActive: 1, isDeleted: 1 });

export default mongoose.model('Staff', staffSchema);
