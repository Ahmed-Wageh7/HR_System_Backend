import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    action: String,
    resource: String,
    resourceId: mongoose.Schema.Types.ObjectId,
    before: Object,
    after: Object,
    ip: String,
    userAgent: String,
    status: {
      type: String,
      enum: ['success', 'failure'],
      default: 'success'
    }
  },
  { timestamps: true }
);

auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

export default mongoose.model('AuditLog', auditLogSchema);
