import { jest } from '@jest/globals';
import permit from '../../src/middleware/rbac.js';

describe('RBAC middleware', () => {
  it('allows users with the required permission', async () => {
    const middleware = permit('staff:read');
    const req = {
      user: {
        permissions: ['staff:read'],
        role: { permissions: [] }
      }
    };
    const next = jest.fn();

    await middleware(req, {}, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('blocks users without the required permission', async () => {
    const middleware = permit('staff:read');
    const req = {
      user: {
        permissions: [],
        role: { permissions: [] }
      }
    };
    const next = jest.fn();

    await middleware(req, {}, next);
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });

  it('allows admin role without checking individual permissions', async () => {
    const middleware = permit('staff:delete');
    const req = {
      user: {
        permissions: [],
        role: { name: 'admin', permissions: [] }
      }
    };
    const next = jest.fn();

    await middleware(req, {}, next);
    expect(next).toHaveBeenCalledWith();
  });
});
