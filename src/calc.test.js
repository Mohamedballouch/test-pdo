import { describe, it, expect } from 'vitest';
import {
  EXAMPLE,
  NO_PAYBACK_TEXT,
  parseNumber,
  normalizeInputs,
  calculate,
  formatMAD,
  formatHours,
  formatPayback,
  buildSummary,
} from './calc.js';

const base = { ...EXAMPLE };

describe('calculate — illustrative example', () => {
  const r = calculate(base);

  it('annual hours saved = people × hours/week × weeks × adoption', () => {
    expect(r.annualHoursSaved).toBeCloseTo(20 * 2 * 46 * 0.7); // 1288
  });

  it('annual gross savings = hours saved × hourly cost', () => {
    expect(r.annualGrossSavings).toBeCloseTo(1288 * 150); // 193 200
  });

  it('first-year net benefit = gross − operating − implementation', () => {
    expect(r.firstYearNetBenefit).toBeCloseTo(193200 - 24000 - 60000); // 109 200
  });

  it('payback = implementation ÷ (gross − operating), in months', () => {
    expect(r.paybackMonths).toBeCloseTo((60000 / (193200 - 24000)) * 12);
    expect(formatPayback(r.paybackMonths)).toBe('4.3 months');
  });
});

describe('calculate — edge cases', () => {
  it('zero people, hours or adoption give zero savings and no payback', () => {
    for (const key of ['people', 'hoursPerWeek', 'weeksPerYear', 'adoptionPercent', 'hourlyCost']) {
      const r = calculate({ ...base, [key]: 0 });
      expect(r.annualGrossSavings).toBe(0);
      expect(r.paybackMonths).toBeNull();
      expect(r.firstYearNetBenefit).toBe(-24000 - 60000);
    }
  });

  it('zero implementation cost gives immediate payback', () => {
    const r = calculate({ ...base, implementationCost: 0 });
    expect(r.paybackMonths).toBe(0);
    expect(formatPayback(r.paybackMonths)).toMatch(/^Immediate/);
  });

  it('zero operating cost still pays back', () => {
    const r = calculate({ ...base, operatingCost: 0 });
    expect(r.firstYearNetBenefit).toBeCloseTo(193200 - 60000);
    expect(r.paybackMonths).toBeCloseTo((60000 / 193200) * 12);
  });

  it('all costs zero: no errors, immediate payback', () => {
    const r = calculate({ ...base, operatingCost: 0, implementationCost: 0 });
    expect(r.firstYearNetBenefit).toBeCloseTo(193200);
    expect(r.paybackMonths).toBe(0);
  });

  it('savings equal to operating cost → no payback', () => {
    const r = calculate({ ...base, operatingCost: 193200 });
    expect(r.paybackMonths).toBeNull();
    expect(formatPayback(r.paybackMonths)).toBe(NO_PAYBACK_TEXT);
  });

  it('savings below operating cost → no payback, even with zero implementation cost', () => {
    const r = calculate({ ...base, operatingCost: 250000, implementationCost: 0 });
    expect(r.paybackMonths).toBeNull();
    expect(formatPayback(r.paybackMonths)).toBe('No payback under these assumptions');
    expect(r.firstYearNetBenefit).toBeLessThan(0);
  });

  it('all-empty inputs produce zeros without NaN or errors', () => {
    const empty = Object.fromEntries(Object.keys(EXAMPLE).map((k) => [k, '']));
    const r = calculate(empty);
    for (const v of [r.annualHoursSaved, r.annualGrossSavings, r.firstYearNetBenefit]) {
      expect(Number.isNaN(v)).toBe(false);
      expect(v === 0).toBe(true); // also rules out -0
    }
    expect(r.paybackMonths).toBeNull();
    expect(() => calculate()).not.toThrow();
    expect(() => calculate(undefined)).not.toThrow();
  });

  it('non-numeric and negative inputs are treated as 0', () => {
    const r = calculate({ ...base, people: 'abc', operatingCost: '-5000', implementationCost: NaN });
    expect(r.annualHoursSaved).toBe(0);
    const r2 = calculate({ ...base, operatingCost: -5000, implementationCost: -1 });
    expect(r2.firstYearNetBenefit).toBeCloseTo(193200);
  });

  it('adoption rate is clamped to 100%', () => {
    expect(calculate({ ...base, adoptionPercent: 250 }).annualHoursSaved).toBeCloseTo(20 * 2 * 46);
  });

  it('accepts numeric strings as produced by form inputs', () => {
    const asStrings = Object.fromEntries(Object.entries(EXAMPLE).map(([k, v]) => [k, String(v)]));
    expect(calculate(asStrings)).toEqual(calculate(base));
  });
});

describe('parseNumber / normalizeInputs', () => {
  it.each([
    ['', 0],
    ['   ', 0],
    [null, 0],
    [undefined, 0],
    ['abc', 0],
    ['-3', 0],
    [-3, 0],
    [Infinity, 0],
    [NaN, 0],
    ['12', 12],
    ['1.5', 1.5],
    ['1,5', 1.5],
    ['60 000', 60000],
    [42, 42],
  ])('parseNumber(%j) → %s', (input, expected) => {
    expect(parseNumber(input)).toBe(expected);
  });

  it('falls back to a default name when the name is empty', () => {
    expect(normalizeInputs({ name: '   ' }).name).toBe('Untitled use case');
    expect(normalizeInputs({ name: '  Invoice triage ' }).name).toBe('Invoice triage');
  });
});

describe('formatting', () => {
  it('formats money in MAD with thousands separators', () => {
    expect(formatMAD(193200)).toBe('193,200 MAD');
    expect(formatMAD(0)).toBe('0 MAD');
    expect(formatMAD(-84000)).toBe('-84,000 MAD');
    expect(formatMAD(1234.6)).toBe('1,235 MAD');
  });

  it('never shows NaN or -0', () => {
    expect(formatMAD(NaN)).toBe('0 MAD');
    expect(formatMAD(-0.2)).toBe('0 MAD');
    expect(formatHours(NaN)).toBe('0 hours');
  });

  it('formats payback periods', () => {
    expect(formatPayback(null)).toBe(NO_PAYBACK_TEXT);
    expect(formatPayback(0)).toMatch(/^Immediate/);
    expect(formatPayback(0.4)).toBe('Less than 1 month');
    expect(formatPayback(1)).toBe('1 month');
    expect(formatPayback(7.25)).toBe('7.3 months');
    expect(formatPayback(30)).toBe('2.5 years');
  });
});

describe('buildSummary', () => {
  it('includes the name and the key figures', () => {
    const text = buildSummary(base);
    expect(text).toContain('Customer meeting summaries');
    expect(text).toContain('1,288 hours');
    expect(text).toContain('193,200 MAD');
    expect(text).toContain('109,200 MAD');
    expect(text).toContain('4.3 months');
    expect(text).toMatch(/estimate/i);
    expect(text).not.toMatch(/NaN|undefined/);
  });

  it('states when there is no payback', () => {
    const text = buildSummary({ ...base, operatingCost: 500000 });
    expect(text).toContain(NO_PAYBACK_TEXT);
  });

  it('handles empty inputs', () => {
    const text = buildSummary({});
    expect(text).toContain('Untitled use case');
    expect(text).toContain(NO_PAYBACK_TEXT);
    expect(text).not.toMatch(/NaN|undefined/);
  });
});
