# HR Express API Reference

## Base URLs

All application routes are mounted under both:

- `/api/v1`
- `/api`

Example:

- `/api/v1/auth/login`
- `/api/auth/login`

System routes outside the API prefix:

- `GET /`
- `GET /health`

## Common Conventions

### Auth

- Most routes require `Authorization: Bearer <accessToken>`.
- Auth refresh/logout routes use the refresh token cookie and `requireRefreshToken`.

### Success response shape

```json
{
  "status": "success",
  "data": {}
}
```

Paginated list endpoints also return:

```json
{
  "status": "success",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalDocuments": 0,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### Common query params for list endpoints

- `page`: default `1`
- `limit`: default `20`, max `100`
- `sort`: format `field_asc` or `field_desc`
- Any extra query keys are treated as Mongo-style equality filters
- Some endpoints support `search`, but only where the service explicitly enables it

### Error response shape

Typical error envelope:

```json
{
  "status": "fail",
  "message": "Error message"
}
```

## Auth

### POST `/auth/signup`

Auth: No

Body:

```json
{
  "name": "Ahmed Wageh",
  "email": "ahmed@example.com",
  "password": "Welcome123",
  "phone": "01000000000"
}
```

Validation:

- `name`: required string
- `email`: required valid email
- `password`: required, min 8, must include uppercase and number
- `phone`: optional string or `null`

Success `201`:

```json
{
  "status": "success",
  "data": {
    "accessToken": "jwt",
    "user": {
      "id": "userId",
      "name": "Ahmed Wageh",
      "email": "ahmed@example.com",
      "role": "staff",
      "permissions": ["leave:create", "leave:read", "attendance:write"]
    }
  }
}
```

Notes:

- Also sets a refresh token cookie.

### POST `/auth/login`

Auth: No

Body:

```json
{
  "email": "ahmed@example.com",
  "password": "Welcome123"
}
```

Success `200`:

```json
{
  "status": "success",
  "data": {
    "accessToken": "jwt",
    "refreshToken": "jwt",
    "user": {
      "id": "userId",
      "name": "Ahmed Wageh",
      "email": "ahmed@example.com",
      "role": "staff",
      "permissions": []
    }
  }
}
```

### POST `/auth/refresh-token`

Auth: Refresh token cookie required

Body: none

Success `200`:

```json
{
  "status": "success",
  "data": {
    "accessToken": "jwt"
  }
}
```

Notes:

- Rotates refresh token cookie.

### POST `/auth/logout`

Auth: Refresh token cookie required

Body: none

Success `200`:

```json
{
  "status": "success",
  "data": {
    "message": "Logged out successfully"
  }
}
```

### POST `/auth/forgot-password`

Auth: No

Body:

```json
{
  "email": "ahmed@example.com"
}
```

Success `200`:

```json
{
  "status": "success",
  "data": {
    "message": "If the email exists, a reset link has been queued."
  }
}
```

### POST `/auth/reset-password/:token`

Auth: No

Body:

```json
{
  "password": "NewPassword123"
}
```

Success `200`:

```json
{
  "status": "success",
  "data": {
    "message": "Password reset successfully"
  }
}
```

## Users

### GET `/users/profile`

Auth: Bearer token required

Body: none

Success `200`:

- Returns the current user profile.

### PUT `/users/profile`

Auth: Bearer token required

Body:

```json
{
  "name": "Updated Name",
  "phone": "01000000000"
}
```

Validation:

- `name`: required string
- `phone`: optional string or `null`

Success `200`:

- Returns the updated user profile.

### DELETE `/users/profile`

Auth: Bearer token required

Body: none

Success `200`:

- Returns the soft-deleted profile payload.

### POST `/users/upload-avatar`

Auth: Bearer token required

Content-Type:

- `multipart/form-data`

Form fields:

- `avatar`: file

Success `200`:

- Returns the updated user/avatar data.

### DELETE `/users/avatar`

Auth: Bearer token required

Body: none

Success `200`:

```json
{
  "status": "success",
  "data": {
    "message": "Avatar deleted successfully"
  }
}
```

## Attendance

### POST `/staff/checkin`

Auth: Bearer token required

Body: none

Success `200`:

- Returns the check-in attendance record.

### POST `/staff/checkout`

Auth: Bearer token required

Body: none

Success `200`:

- Returns the updated attendance record with checkout data.

## Leaves

### POST `/leaves`

Auth: Bearer token required

Body:

```json
{
  "reason": "Annual leave",
  "startDate": "2026-05-01",
  "endDate": "2026-05-03"
}
```

Validation:

- `reason`: required string
- `startDate`: required date
- `endDate`: required date, must be on or after `startDate`

Success `201`:

- Returns the created leave request.

### GET `/leaves`

Auth: Bearer token required

Query:

- `page`, `limit`, `sort`

Success `200`:

- Returns paginated current-user leave requests.

### GET `/leaves/:id`

Auth: Bearer token required

Success `200`:

- Returns one leave request for the current user.

### DELETE `/leaves/:id`

Auth: Bearer token required

Success `200`:

```json
{
  "status": "success",
  "data": {
    "message": "Leave cancelled successfully"
  }
}
```

## Tickets

### POST `/tickets`

Auth: Bearer token required

Body:

```json
{
  "subject": "Payroll issue",
  "description": "Salary not received yet"
}
```

Success `201`:

- Returns the created ticket.

### GET `/tickets`

Auth: Bearer token required

Query:

- `page`, `limit`, `sort`

Success `200`:

- Returns paginated current-user tickets.

### GET `/tickets/:id`

Auth: Bearer token required

Success `200`:

- Returns a single current-user ticket.

### POST `/tickets/:id/reply`

Auth: Bearer token required

Body:

```json
{
  "message": "Any update?"
}
```

Success `200`:

- Returns the updated ticket including `replies`.

## Admin

All admin routes are under `/admin` and require Bearer auth plus the relevant permission.

## Admin Staff

### POST `/admin/staff`

Body:

```json
{
  "name": "Employee Name",
  "email": "employee@example.com",
  "phone": "01000000000",
  "dailySalary": 500,
  "joinDate": "2026-04-01",
  "department": "680f...",
  "position": "HR Specialist"
}
```

Validation:

- `name`: required
- `email`: required
- `phone`: optional
- `dailySalary`: required positive number
- `joinDate`: optional date
- `department`: optional 24-char object id, empty string or `null`
- `position`: optional string

Success `201`:

- Returns created staff record populated with `user` and `department`.

Notes:

- Backend creates the linked user automatically with default password `Welcome123`.

### GET `/admin/staff`

Query:

- `page`, `limit`, `sort`
- filterable fields include values like `employeeCode` and direct field equality

Success `200`:

- Returns paginated staff list.

### GET `/admin/staff/:id`

Success `200`:

- Returns one staff record with `user` and `department`.

### PUT `/admin/staff/:id`

Body:

```json
{
  "dailySalary": 650,
  "joinDate": "2026-04-01",
  "department": "680f...",
  "position": "Senior HR Specialist",
  "isActive": true
}
```

Success `200`:

- Returns updated staff record.

### DELETE `/admin/staff/:id`

Success `200`:

- Returns soft-deleted staff record.

### PATCH `/admin/staff/:id/restore`

Success `200`:

- Returns restored staff record.

### GET `/admin/staff/:id/attendance`

Query:

- `page`, `limit`, `sort`

Success `200`:

- Returns paginated attendance records for that staff member.

### GET `/admin/staff/:id/attendance/:month`

Path param:

- `month`: expected format `YYYY-MM`

Success `200`:

```json
{
  "status": "success",
  "data": {
    "totalDays": 0,
    "lateDays": 0,
    "absentDays": 0,
    "hoursWorked": 0
  }
}
```

### POST `/admin/staff/:id/deductions`

Body:

```json
{
  "month": "2026-04",
  "amount": 100,
  "reason": "Late arrival"
}
```

Success `201`:

- Returns created deduction.

### GET `/admin/staff/:id/deductions`

Query:

- `page`, `limit`, `sort`

Success `200`:

- Returns paginated deductions for that staff member.

### PUT `/admin/staff/:id/deductions/:did`

Body:

```json
{
  "month": "2026-04",
  "amount": 150,
  "reason": "Late arrival updated"
}
```

Success `200`:

- Returns updated deduction.

### DELETE `/admin/staff/:id/deductions/:did`

Success `200`:

```json
{
  "status": "success",
  "data": {
    "message": "Deduction removed successfully"
  }
}
```

### GET `/admin/staff/:id/salary/:month`

Path param:

- `month`: expected format `YYYY-MM`

Success `200`:

- Returns calculated monthly salary summary.

### POST `/admin/staff/:id/salary/:month/pay`

Success `200`:

- Returns paid monthly salary summary.

### PUT `/admin/staff/:id/salary/:month/adjust`

Body:

```json
{
  "adjustments": 200
}
```

Success `200`:

```json
{
  "status": "success",
  "data": {
    "message": "Salary adjusted successfully"
  }
}
```

### POST `/admin/staff/salary/:month/bulk-pay`

Success `202`:

```json
{
  "status": "success",
  "data": {
    "message": "Bulk salary processing queued"
  }
}
```

### POST `/admin/staff/:id/documents`

Content-Type:

- `multipart/form-data`

Form fields:

- `document`: file

Success `201`:

- Returns created document object:

```json
{
  "status": "success",
  "data": {
    "_id": "docId",
    "name": "contract.pdf",
    "url": "https://...",
    "publicId": "optional-cloudinary-id",
    "path": "optional-local-path",
    "mimeType": "application/pdf",
    "uploadedAt": "2026-04-29T00:00:00.000Z"
  }
}
```

### DELETE `/admin/staff/:id/documents/:docId`

Success `200`:

```json
{
  "status": "success",
  "data": {
    "message": "Document deleted successfully"
  }
}
```

## Admin Roles

### POST `/admin/roles`

Body:

```json
{
  "name": "manager",
  "description": "Manager role",
  "permissions": ["reports:view", "leave:approve"]
}
```

Success `201`:

- Returns created role.

### GET `/admin/roles`

Query:

- `page`, `limit`, `sort`

Success `200`:

- Returns paginated roles.

### PUT `/admin/roles/:id`

Body:

```json
{
  "name": "manager",
  "description": "Updated role",
  "permissions": ["reports:view", "leave:approve"]
}
```

Success `200`:

- Returns updated role.

### DELETE `/admin/roles/:id`

Success `200`:

```json
{
  "status": "success",
  "data": {
    "message": "Role deleted successfully"
  }
}
```

### POST `/admin/roles/:id/permissions`

Body:

```json
{
  "permissions": ["staff:create", "staff:update"]
}
```

Success `200`:

- Returns updated role.

### DELETE `/admin/roles/:id/permissions`

Body:

```json
{
  "permissions": ["staff:create"]
}
```

Success `200`:

- Returns updated role.

### POST `/admin/roles/users/:id/roles`

Body:

```json
{
  "roleId": "680f..."
}
```

Success `200`:

- Returns updated user with populated role.

## Admin Audit Logs

### GET `/admin/audit-logs`

Query:

- `page`, `limit`, `sort`
- direct equality filters like `action`, `resource`, `status`, `user`

Success `200`:

- Returns paginated audit logs.

### GET `/admin/audit-logs/user/:userId`

Query:

- `page`, `limit`, `sort`

Success `200`:

- Returns paginated audit logs for one user.

### GET `/admin/audit-logs/resource/:resource`

Query:

- `page`, `limit`, `sort`

Success `200`:

- Returns paginated audit logs for one resource type.

## Admin Departments

### POST `/admin/departments`

Body:

```json
{
  "name": "Human Resources",
  "description": "HR department"
}
```

Success `201`:

- Returns created department.

### GET `/admin/departments`

Query:

- `page`, `limit`, `sort`

Success `200`:

- Returns paginated departments.

### PUT `/admin/departments/:id`

Body:

```json
{
  "name": "Human Resources",
  "description": "Updated description"
}
```

Success `200`:

- Returns updated department.

### DELETE `/admin/departments/:id`

Success `200`:

```json
{
  "status": "success",
  "data": {
    "message": "Department deleted successfully"
  }
}
```

### PATCH `/admin/departments/:id/restore`

Success `200`:

- Returns restored department.

## Admin Reports

### GET `/admin/reports/payroll/:month`

Path param:

- `month`: expected format `YYYY-MM`

Success `200`:

- Returns an array of staff payroll entries:

```json
{
  "status": "success",
  "data": [
    {
      "staffId": "staffId",
      "employeeCode": "EMP-00001",
      "name": "Ahmed",
      "department": "HR",
      "salary": {}
    }
  ]
}
```

### GET `/admin/reports/attendance/:month`

Path param:

- `month`: expected format `YYYY-MM`

Success `200`:

- Returns attendance records in that month, populated with `staff.user`.

### GET `/admin/reports/staff/:id/history`

Success `200`:

- Returns:

```json
{
  "status": "success",
  "data": {
    "staff": {},
    "attendance": [],
    "monthlyReports": []
  }
}
```

## Admin Leaves

### GET `/admin/leaves`

Query:

- `page`, `limit`, `sort`
- direct equality filters are supported

Success `200`:

- Returns paginated leave requests populated with `staff.user`.

### PATCH `/admin/leaves/:id/status`

Body:

```json
{
  "status": "approved",
  "reviewNote": "Approved"
}
```

Validation:

- `status`: required, one of `approved`, `rejected`
- `reviewNote`: optional string or `null`

Success `200`:

- Returns updated leave.

## Admin Users

### PATCH `/admin/users/:id/restore`

Success `200`:

- Returns restored user.

## Admin Tickets

### PATCH `/admin/tickets/:id/status`

Body:

```json
{
  "status": "resolved"
}
```

Allowed values from model:

- `open`
- `in_progress`
- `resolved`
- `closed`

Success `200`:

- Returns updated ticket.

## Realtime Notifications

There is no REST `/notifications` API in this project.

Realtime notifications use Socket.IO on the default path:

- `/socket.io/`

Supported socket events:

- client emits `authenticate` with JWT token
- admin emits `admin:send-message` with notification payload
- server emits `user:receive-message`

`admin:send-message` payload shape:

```json
{
  "type": "announcement",
  "title": "Notice",
  "message": "Message text",
  "targetRole": "all",
  "expiresAt": "2026-05-01T00:00:00.000Z"
}
```

Known message enums from the model:

- `type`: `announcement`, `payroll`, `warning`
- `targetRole`: `all`, `staff`, `admin`
