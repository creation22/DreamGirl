// Surplus reports costs in USD microdollars (1 USD = 1,000,000).
export const SURPLUS_URL = "https://www.surplusintelligence.ai/?utm_source=dreamher&utm_medium=referral";

/** $0.0074 for sub-cent amounts, $0.012 under a dollar, $3.41 above. */
export function usd(micro) {
  const v = (Number(micro) || 0) / 1e6;
  if (v === 0) return "$0";
  if (v < 0.01) return `$${v.toFixed(4)}`;
  if (v < 1) return `$${v.toFixed(3)}`;
  return `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Whole-percent saving against list price, or null when unknown. */
export function savedPct(costMicro, listMicro) {
  if (!listMicro || !costMicro || costMicro >= listMicro) return null;
  return Math.round((1 - costMicro / listMicro) * 100);
}
