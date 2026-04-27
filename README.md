# HR Management System Backend

Node.js, Express, MongoDB backend for an HR management system with authentication, RBAC, attendance, leave management, reports, tickets, queues, and Socket.IO notifications.

## Tech Stack

- Node.js 20+
- Express
- MongoDB with Mongoose
- Redis with Bull
- Socket.IO
- Joi
- Jest and Supertest

## Features

- JWT access tokens and refresh token rotation
- Role-based access control with seeded system roles
- Staff, attendance, leaves, departments, reports, audit logs, tickets, and roles modules
- CSRF protection, secure cookies, rate limiting, request logging, and Helmet
- Background jobs for email, cleanup, absence checks, and salary tasks
- File uploads with local storage
- API mounts available at `/api/v1` and `/api`

## Project Structure

```text
config/
docs/
src/
  common/
  database/
  middleware/
  model/
  modules/v1/
  utils/
tests/
uploads/
logs/
```

## Prerequisites

- Node.js 20 or later
- MongoDB
- Redis

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the example environment file:

```bash
cp .env.example .env
```

3. Update the required values in `.env`:

- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `COOKIE_SECRET`
- `MONGODB_URI`

4. Start the server:

```bash
npm run dev
```

For a production-style start:

```bash
npm start
```

## Environment Variables

The repository includes [.env.example](/Users/ahmedwageh/Desktop/Hr_System_Backend/.env.example:1) with all supported keys.

Important values:

- `PORT`
- `NODE_ENV`
- `CLIENT_URL`
- `MONGODB_URI`
- `MONGODB_LOCAL_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `COOKIE_SECRET`
- `REDIS_HOST`
- `REDIS_PORT`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `UPLOAD_DIR`

## API Notes

Main mounted prefixes:

- `/api/v1`
- `/api`

Examples:

- `POST /api/v1/auth/login`
- `GET /api/v1/users/profile`
- `GET /api/v1/admin/leaves`
- `PATCH /api/v1/admin/leaves/:id/status`
- `GET /api/v1/admin/reports/payroll/:month`
- `GET /api/v1/admin/reports/attendance/:month`
- `GET /api/v1/admin/reports/staff/:id/history`

## Testing

Run unit tests with:

```bash
npm test
```

Coverage:

```bash
npm run test:coverage
```

## GitHub Publishing Checklist

This project is ready to publish with:

- `.env` ignored
- `node_modules` ignored
- runtime logs ignored
- `uploads/.gitkeep` and `logs/.gitkeep` preserved
- `.env.example` included for setup

Suggested first push:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Deployment Notes

- Set `NODE_ENV=production`
- Provide real secrets for JWT and cookies
- Point `MONGODB_URI` to your production database
- Point `REDIS_HOST` and `REDIS_PORT` to your Redis instance
- Set `CLIENT_URL` to your frontend domain
- In production, SMTP and Cloudinary configuration should also be provided

## Included Assets

- Postman collection: [docs/postman/hr-system.postman_collection.json](/Users/ahmedwageh/Desktop/Hr_System_Backend/docs/postman/hr-system.postman_collection.json:1)
