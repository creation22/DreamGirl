import { useEffect, useState } from "react";
import { getStats } from "./api";

/** Live totals from /api/stats, or null until there's at least one cover. */
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
