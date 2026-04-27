import User from '../model/user.model.js';
import Staff from '../model/staff.model.js';
import Attendance from '../model/attendance.model.js';
import AuditLog from '../model/auditLog.model.js';
import RefreshToken from '../model/refreshToken.model.js';
import Leave from '../model/leave.model.js';
import Role from '../model/role.model.js';
import Department from '../model/department.model.js';

export default async () => {
  await Promise.all([
    User.syncIndexes(),
    Staff.syncIndexes(),
    Attendance.syncIndexes(),
    AuditLog.syncIndexes(),
    RefreshToken.syncIndexes(),
    Leave.syncIndexes(),
    Role.syncIndexes(),
    Department.syncIndexes()
  ]);
};
