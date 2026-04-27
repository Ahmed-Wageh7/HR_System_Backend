import AuditLog from '../../model/auditLog.model.js';

export const createAuditLog = async ({
  user,
  action,
  resource,
  resourceId,
  before,
  after,
  status = "success",
  req,
  session,
}) => {
  const payload = {
    user,
    action,
    resource,
    resourceId,
    before,
    after,
    status,
    ip: req?.ip,
    userAgent: req?.headers["user-agent"],
  };

  return AuditLog.create([payload], session ? { session } : undefined);
};

export default {
  createAuditLog
};
