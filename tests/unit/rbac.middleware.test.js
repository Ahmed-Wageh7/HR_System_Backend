import test from 'node:test';
import assert from 'node:assert/strict';
import permit from '../../src/middleware/rbac.js';

test('allows users with the required permission', async () => {
  const middleware = permit('staff:read');
  const req = {
    user: {
      permissions: ['staff:read'],
      role: { permissions: [] }
    }
  };
  const calls = [];
  const next = (...args) => calls.push(args);

  await middleware(req, {}, next);
  assert.deepEqual(calls, [[]]);
});

test('blocks users without the required permission', async () => {
  const middleware = permit('staff:read');
  const req = {
    user: {
      permissions: [],
      role: { permissions: [] }
    }
  };
  const calls = [];
  const next = (...args) => calls.push(args);

  await middleware(req, {}, next);
  assert.equal(calls[0][0].statusCode, 403);
});

test('allows admin role without checking individual permissions', async () => {
  const middleware = permit('staff:delete');
  const req = {
    user: {
      permissions: [],
      role: { name: 'admin', permissions: [] }
    }
  };
  const calls = [];
  const next = (...args) => calls.push(args);

  await middleware(req, {}, next);
  assert.deepEqual(calls, [[]]);
});
