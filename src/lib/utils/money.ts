/**
 * Money is always represented as integer "sen" (1 RM = 100 sen) to avoid
 * floating point rounding errors, mirroring the `numeric`/`integer` columns
 * used in the database (see supabase/migrations/0001_init.sql).
 *
 * Never do arithmetic on formatted strings or floats — only on sen integers.
 */
export type Sen = number;

export function ringgit(sen: Sen): number {
  return sen / 100;
}

export function toSen(ringgit: number): Sen {
  return Math.round(ringgit * 100);
}

const formatter = new Intl.NumberFormat('en-MY', {
  style: 'currency',
  currency: 'MYR',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format sen as "RM 1,234.50" */
export function formatMoney(sen: Sen): string {
  const formatted = formatter.format(ringgit(Math.max(0, sen)));
  // Intl gives "RM1,234.50" for en-MY; add the space TapTap's brand uses.
  return formatted.replace(/^RM\s?/, 'RM ');
}

export function sumSen(values: Sen[]): Sen {
  return values.reduce((total, v) => total + v, 0);
}
