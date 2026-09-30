// Pure calculation and formatting helpers. No DOM access, so everything here is unit-tested.

/** Illustrative example shown when the app opens. */
export const EXAMPLE = Object.freeze({
  name: 'Customer meeting summaries',
  people: 20,
  hoursPerWeek: 2,
  weeksPerYear: 46,
  hourlyCost: 150,
  adoptionPercent: 70,
  implementationCost: 60000,
  operatingCost: 24000,
});

/**
 * Convert raw input (string or number) into a finite, non-negative number.
 * Empty, non-numeric, infinite and negative values become 0, so results never show NaN.
 * Accepts a comma as decimal separator ("1,5" → 1.5) and ignores spaces ("60 000" → 60000).
 */
export function parseNumber(input) {
  if (typeof input === 'number') {
    return Number.isFinite(input) && input > 0 ? input : 0;
  }
  if (typeof input !== 'string') return 0;
  const cleaned = input.replace(/\s/g, '').replace(',', '.');
  if (cleaned === '') return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Normalise raw inputs; adoption is a percentage clamped to 0–100. */
export function normalizeInputs(raw = {}) {
  return {
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : 'Untitled use case',
    people: parseNumber(raw.people),
    hoursPerWeek: parseNumber(raw.hoursPerWeek),
    weeksPerYear: parseNumber(raw.weeksPerYear),
    hourlyCost: parseNumber(raw.hourlyCost),
    adoptionPercent: Math.min(100, parseNumber(raw.adoptionPercent)),
    implementationCost: parseNumber(raw.implementationCost),
    operatingCost: parseNumber(raw.operatingCost),
  };
}

/**
 * Compute results from (raw or normalised) inputs.
 * paybackMonths is null when annual gross savings do not exceed the annual operating cost,
 * and 0 when there is no implementation cost to recover.
 */
export function calculate(raw) {
  const i = normalizeInputs(raw);
  const adoption = i.adoptionPercent / 100;
  const annualHoursSaved = i.people * i.hoursPerWeek * i.weeksPerYear * adoption;
  const annualGrossSavings = annualHoursSaved * i.hourlyCost;
  const firstYearNetBenefit = annualGrossSavings - i.operatingCost - i.implementationCost;
  const annualNetSavings = annualGrossSavings - i.operatingCost;
  let paybackMonths = null;
  if (annualNetSavings > 0) {
    paybackMonths = (i.implementationCost / annualNetSavings) * 12;
  }
  return { annualHoursSaved, annualGrossSavings, firstYearNetBenefit, annualNetSavings, paybackMonths };
}

export const NO_PAYBACK_TEXT = 'No payback under these assumptions';

const madFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const hoursFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

/** Format a monetary amount in Moroccan dirham, e.g. "12,345 MAD" or "-1,200 MAD". */
export function formatMAD(value) {
  const n = Number.isFinite(value) ? Math.round(value) : 0;
  // Avoid "-0 MAD" for tiny negative values that round to zero.
  return `${madFormatter.format(n === 0 ? 0 : n)} MAD`;
}

export function formatHours(value) {
  const n = Number.isFinite(value) ? Math.round(value) : 0;
  return `${hoursFormatter.format(n === 0 ? 0 : n)} hours`;
}

/** Human-readable payback period. */
export function formatPayback(paybackMonths) {
  if (paybackMonths === null || !Number.isFinite(paybackMonths)) return NO_PAYBACK_TEXT;
  if (paybackMonths === 0) return 'Immediate (no implementation cost)';
  if (paybackMonths < 1) return 'Less than 1 month';
  const months = Math.round(paybackMonths * 10) / 10;
  if (months < 24) return `${months} ${months === 1 ? 'month' : 'months'}`;
  const years = Math.round((paybackMonths / 12) * 10) / 10;
  return `${years} years`;
}

/** Plain-language business case suitable for an email or a slide. */
export function buildSummary(raw) {
  const i = normalizeInputs(raw);
  const r = calculate(i);
  const payback = formatPayback(r.paybackMonths);
  const paybackSentence =
    r.paybackMonths === null
      ? `${NO_PAYBACK_TEXT}: annual savings do not exceed the annual operating cost.`
      : `Estimated payback: ${payback.charAt(0).toLowerCase()}${payback.slice(1)}.`;

  return [
    `Business case (estimate): ${i.name}`,
    '',
    `If ${i.people} people each save ${i.hoursPerWeek} hours per week over ${i.weeksPerYear} working weeks, ` +
      `with ${i.adoptionPercent}% adoption, the team saves about ${formatHours(r.annualHoursSaved)} a year.`,
    `At ${formatMAD(i.hourlyCost)} per hour, that is worth about ${formatMAD(r.annualGrossSavings)} a year in gross savings.`,
    `After a one-time implementation cost of ${formatMAD(i.implementationCost)} and an annual operating cost of ` +
      `${formatMAD(i.operatingCost)}, the first-year net benefit is ${formatMAD(r.firstYearNetBenefit)}.`,
    paybackSentence,
    '',
    'These figures are estimates based on the assumptions above and should be validated before committing budget.',
  ].join('\n');
}
