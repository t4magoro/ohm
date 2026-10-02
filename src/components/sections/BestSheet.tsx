import { Fragment } from "react";
import { BEST_KEY, bestText, crowdOf, SAID } from "@/content/thinking";
import type { Why } from "@/lib/protocol";

/**
 * Best of 5 in the (!) sheet: every try as a lane of its words, linked in lemon where 2+ people typed the pair and
 * faintly where only 1 did, a meter for its score, and a flag on the one he said.
 */
export function BestSheet({ why }: { why: Why }) {
  return (
    <div className="space-y-2">
      <p className="leading-snug">{bestText(why)}</p>
      <ol className="space-y-1.5">
        {why.tries!.map((t, i) => {
          const said = i === why.chosen;
          return (
            <li key={i} className="space-y-1">
              <p className="flex flex-wrap items-center gap-y-1">
                <span className="mr-2 w-3 font-pixel text-[10px] text-dim">{said ? "▶" : i + 1}</span>
                {t.words.map((w, j) => (
                  <Fragment key={j}>
                    {j > 0 && <span className={`h-0.5 w-3 ${t.crowd[j - 1] ? "bg-lemon" : "bg-dim/40"}`} />}
                    <span className={`border px-1 ${said ? "border-mint text-mint" : "border-edge text-dim"}`}>{w}</span>
                  </Fragment>
                ))}
              </p>
              <p className="flex items-center gap-2 pl-5 text-base">
                <span className="h-1.5 w-24 bg-screen">
                  <span className="block h-full bg-lemon" style={{ width: `${(crowdOf(t) / Math.max(t.crowd.length, 1)) * 100}%` }} />
                </span>
                <span className={`ml-auto shrink-0 tabular-nums ${said ? "text-mint" : "text-dim"}`}>
                  {crowdOf(t)} of {t.crowd.length}
                  {said && ` · ${SAID}`}
                </span>
              </p>
            </li>
          );
        })}
      </ol>
      <p className="font-pixel text-[10px] text-dim">{BEST_KEY}</p>
    </div>
  );
}