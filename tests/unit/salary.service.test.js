import test from 'node:test';
import assert from 'node:assert/strict';
import { getWorkingDaysInMonth } from '../../src/modules/v1/salary/salary.service.js';

test('returns working days for a month excluding Friday and Saturday', () => {
  assert.ok(getWorkingDaysInMonth('2026-04') > 0);
  assert.equal(getWorkingDaysInMonth('2026-04'), 22);
});
