import { dayKeyOf, monthKeyOf } from './ClientPortal';

describe('date matching helpers', () => {
  test('keeps date-only weekly report keys stable across timezone parsing', () => {
    expect(dayKeyOf('2025-08-18')).toBe('2025-08-18');
    expect(dayKeyOf('2025-08-18T00:00:00+05:30')).toBe('2025-08-18');
  });

  test('normalizes month keys from report dates', () => {
    expect(monthKeyOf('2025-08-18')).toBe('2025-08');
    expect(monthKeyOf('2025-08-18T16:45:00-04:00')).toBe('2025-08');
  });
});
