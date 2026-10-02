import { Fragment } from "react";
import { bestLabel, crowdOf } from "@/content/thinking";
import type { Why } from "@/lib/protocol";

const LABEL = "font-pixel text-[clamp(10px,3.2cqw,12px)]";

/** A try as a lane: a block per word, linked in lemon where 2+ people typed the pair, faint where only 1 did. */
function Lane({ crowd }: { crowd: boolean[] }) {
  return (
    <span className="inline-flex items-center">
      <span className="size-[0.4em] bg-current" />
      {crowd.map((c, i) => (
        <Fragment key={i}>
          <span className={`h-[0.15em] w-[0.45em] ${c ? "bg-lemon" : "bg-current opacity-30"}`} />
          <span className="size-[0.4em] bg-current" />
        </Fragment>
      ))}
    </span>
  );
}

/** Best of 5 on Ohm's screen: each try as a lane with its score, and a flag on the one he said. */
export function BestScreen({ why }: { why: Why }) {
  return (
    <>
      <p className={`${LABEL} opacity-70`}>{bestLabel(why)}</p>
      {why.tries!.map((t, i) => (
        <p key={i} className={`flex items-center gap-[4%] px-[3%] text-[0.7em] leading-[1.3] ${i === why.chosen ? "" : "opacity-50"}`}>
          <span className="w-[0.8em]">{i === why.chosen ? "▶" : ""}</span>
          <Lane crowd={t.crowd} />
          <span className="ml-auto tabular-nums">
            {crowdOf(t)}/{t.crowd.length}
          </span>
        </p>
      ))}
    </>
  );
}