import mongoose from 'mongoose';
import baseFields from './plugins/baseFields.js';

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: String,
    permissions: {
      type: [String],
      default: []
    },
    isSystem: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

baseFields(roleSchema);

export default mongoose.model('Role', roleSchema);
