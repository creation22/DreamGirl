import { useEffect, useState } from "react";
import { getStats } from "../lib/api";
import { savedPct, usd } from "../utils/money";

/** Live totals: how many portraits, what they cost on Surplus, what list price would have been. */
export function useSurplusStats() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    let live = true;
    getStats()
      .then((s) => live && setStats(s))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  return stats && stats.portraits > 0 ? stats : null;
}

export function StatsCard({ stats }) {
  const saved = savedPct(stats.costMicro, stats.listMicro);
  const avg = Math.round(stats.costMicro / stats.portraits);
  const rows = [
    { label: "portraits drawn", value: stats.portraits.toLocaleString("en-US") },
    { label: "paid on Surplus, all of them together", value: usd(stats.costMicro), hot: true },
    { label: "per portrait, on average", value: usd(avg) },
  ];
  if (stats.listMicro > stats.costMicro) rows.push({ label: "the same portraits at list price", value: usd(stats.listMicro), struck: true });

  return (
    <div className="nb-card overflow-hidden">
      <dl className="divide-y-3 divide-ink">
        {rows.map((r) => (
          <div key={r.label} className={`flex items-baseline justify-between gap-4 px-5 py-4 ${r.hot ? "bg-pink" : ""}`}>
            <dt className="text-sm font-semibold">{r.label}</dt>
            <dd className={`font-display text-2xl tabular-nums sm:text-3xl ${r.struck ? "text-neutral-500 line-through decoration-[3px]" : ""}`}>
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
      {saved !== null && (
        <p className="border-t-3 border-ink bg-pink-soft px-5 py-3 text-sm font-bold">{saved}% less than list price, live.</p>
      )}
    </div>
  );
}
