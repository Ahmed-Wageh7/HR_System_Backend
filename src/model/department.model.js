import mongoose from 'mongoose';
import baseFields from './plugins/baseFields.js';

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: String
  },
  { timestamps: true }
);

baseFields(departmentSchema);

export default mongoose.model('Department', departmentSchema);
