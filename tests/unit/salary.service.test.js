import { getWorkingDaysInMonth } from '../../src/modules/v1/salary/salary.service.js';

describe('Salary helpers', () => {
  it('returns working days for a month excluding Friday and Saturday', () => {
    expect(getWorkingDaysInMonth('2026-04')).toBeGreaterThan(0);
    expect(getWorkingDaysInMonth('2026-04')).toBe(22);
  });
});
