import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { SURPLUS_URL } from "../utils/money";

const price = (n) => `$${n.toFixed(2)}`;
const OPUS_URL = SURPLUS_URL.replace("utm_medium=referral", "utm_medium=referral&utm_content=opus-5-5-banner");

/** Today's best Claude Opus 5.5 offer on Surplus, live from /api/deal. Hidden if it can't load. */
export default function OpusBanner() {
  const [deal, setDeal] = useState(null);

  useEffect(() => {
    let live = true;
    fetch("/api/deal")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => live && d?.pct > 0 && setDeal(d))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  if (!deal) return null;

  return (
    <section aria-labelledby="opus-deal" className="border-t-3 border-ink bg-ink text-white">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_400px] lg:gap-14 lg:py-16">
        <div>
          <p className="inline-flex rounded-lg border-3 border-white px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
            Also on Surplus Intelligence
          </p>
          <h2 id="opus-deal" className="mt-5 font-display text-[clamp(2.1rem,6vw,3.6rem)] leading-[1.05]">
            Claude Opus 5.5,{" "}
            <span className="mt-2 inline-block -rotate-[1.5deg] rounded-xl border-3 border-white bg-pink px-3 pb-1 text-ink shadow-nb-w">
              up to {deal.pct}% off
            </span>
          </h2>
          <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-mist">
            The same marketplace that drew her for less than a cent sells spare capacity on Anthropic&apos;s top
            model{deal.sellers > 0 ? `, from ${deal.sellers} sellers` : ""}. One API, OpenAI-compatible.
          </p>
        </div>

        <div className="rounded-xl border-3 border-white bg-white p-5 text-ink shadow-nb-w sm:p-6">
          <table className="w-full text-left tabular-nums">
            <caption className="mb-3 text-left text-sm font-bold text-neutral-600">Per million tokens</caption>
            <thead>
              <tr className="border-b-3 border-ink text-sm">
                <th scope="col" className="pb-2 font-bold" />
                <th scope="col" className="pb-2 text-right font-semibold text-neutral-600">List price</th>
                <th scope="col" className="pb-2 text-right font-bold">On Surplus</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Input", deal.listIn, deal.bestIn],
                ["Output", deal.listOut, deal.bestOut],
              ].map(([label, list, best]) => (
                <tr key={label} className="border-b-2 border-dashed border-neutral-300 last:border-0">
                  <th scope="row" className="py-3 font-semibold">{label}</th>
                  <td className="py-3 text-right text-neutral-500 line-through">{price(list)}</td>
                  <td className="py-3 text-right">
                    <span className="rounded-md border-3 border-ink bg-pink px-2 py-0.5 font-display text-lg">{price(best)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <a href={OPUS_URL} target="_blank" rel="noopener noreferrer" className="nb-btn-pink mt-5 w-full">
            Try Opus 5.5 on Surplus
            <ArrowUpRight className="h-5 w-5" strokeWidth={2.5} aria-hidden />
          </a>
          <p className="mt-3 text-xs leading-relaxed text-neutral-600">
            Best live offer on the Surplus market right now. Prices move through the day.
          </p>
        </div>
      </div>
    </section>
  );
}
