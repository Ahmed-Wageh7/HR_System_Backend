import Role from '../model/role.model.js';
import User from '../model/user.model.js';

const SYSTEM_ROLES = [
  {
    name: 'admin',
    description: 'System administrator',
    isSystem: true,
    permissions: [
      'staff:create',
      'staff:read',
      'staff:update',
      'staff:delete',
      'salary:read',
      'salary:pay',
      'salary:adjust',
      'attendance:read',
      'attendance:write',
      'leave:create',
      'leave:read',
      'leave:approve',
      'reports:view',
      'audit:read',
      'roles:manage',
      'department:manage',
      'users:manage',
      'tickets:manage'
    ]
  },
  {
    name: 'hr_manager',
    description: 'Human resources manager',
    isSystem: true,
    permissions: [
      'staff:read',
      'staff:update',
      'salary:read',
      'attendance:read',
      'leave:approve',
      'reports:view'
    ]
  },
  {
    name: 'staff',
    description: 'Staff member',
    isSystem: true,
    permissions: ['attendance:write', 'leave:create', 'leave:read']
  }
];

export default async () => {
  const roles = await Promise.all(
    SYSTEM_ROLES.map((role) =>
      Role.findOneAndUpdate({ name: role.name }, role, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      })
    )
  );

  await Promise.all(
    roles.map((role) => User.updateMany({ role: role._id }, { permissions: [...new Set(role.permissions)] }))
  );
};
