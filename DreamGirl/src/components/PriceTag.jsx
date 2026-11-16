import { savedPct, usd } from "../utils/money";

/**
 * The sticker on a portrait: what it really cost to draw, the list price struck
 * through, and the percent saved. `large` on the result page, small on gallery cards.
 */
export default function PriceTag({ costMicro, listMicro, large = false, className = "" }) {
  if (!(costMicro > 0)) return null;
  const pct = savedPct(costMicro, listMicro);
  const pad = large ? "px-2.5 py-1.5" : "px-1.5 py-0.5";
  return (
    <p
      className={`flex items-stretch overflow-hidden rounded-lg border-3 border-ink bg-white font-bold tabular-nums leading-none shadow-nb-sm ${
        large ? "text-base" : "text-xs"
      } ${className}`}
      title={`What she cost to draw${listMicro ? `, list price ${usd(listMicro)}` : ""}`}
    >
      <span className={`flex items-baseline gap-1.5 ${pad}`}>
        {large && <span className="text-xs font-semibold text-neutral-600">Cost</span>}
        {usd(costMicro)}
        {pct !== null && <s className="font-semibold text-neutral-500">{usd(listMicro)}</s>}
      </span>
      {pct !== null && <span className={`border-l-3 border-ink bg-pink ${pad}`}>{pct}% off</span>}
    </p>
  );
}
