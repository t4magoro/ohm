import { Fragment } from "react";
import { attentionOf, isWrittenBest, WEND } from "@/content/thinking";
import type { Why } from "@/lib/protocol";
import { Dots } from "../ui/Dots";

// Ohm's screen for a reply brain v4 wrote (why.written), the owner's pick from the prototypes (D): the reply so far on
// top, your words lit by where he looked, and after the arrow a reel that runs through the words he could say and lands
// on his. The word joins the reply on top only once the reel has landed.
const LABEL = "font-pixel text-[clamp(10px,3.2cqw,12px)]";
const ROW = "flex items-center gap-[4%] px-[3%]";
const REEL_MS = 900; // --animate-reel in animations.css
const LIT = ["", "bg-mint/25", "bg-mint/55", "bg-mint text-screen"]; // attention, 0 to 3
const pc = (p: number) => `${Math.round(p * 100)}%`;
const say = (w: string) => (w === WEND ? "(stop)" : w);
type Written = NonNullable<Why["written"]>;
type Step = Written["steps"][number];

function SoFar({ w, i }: { w: Written; i: number }) {
  const words = w.steps.slice(0, i + 1).map((s) => s.word).filter((x) => x !== WEND);
  const fresh = w.steps[i].word === WEND ? -1 : words.length - 1;
  return (
    <p className="line-clamp-2 text-[0.75em]">
      {words.map((x, j) => (
        <Fragment key={j}>
          {j > 0 && " "}
          <span className={j === fresh ? "inline-block bg-mint text-screen motion-safe:animate-in-right" : "opacity-70"} style={j === fresh ? { animationDelay: `${REEL_MS}ms` } : undefined}>
            {x}
          </span>
        </Fragment>
      ))}
      {fresh < 0 && <span className="opacity-70"> (stop)</span>}
    </p>
  );
}

/** The dice as a reel: the top 5 twice, then his word, stepping one word at a time (pixel style). */
function Reel({ s }: { s: Step }) {
  const reel = [...s.top.map(([x]) => x), ...s.top.map(([x]) => x), s.word];
  const n = reel.length - 1;
  return (
    <span className="relative inline-block h-[1.3em] overflow-hidden border-y-2 border-current px-[0.2em] align-middle">
      <span className="block motion-safe:animate-reel" style={{ animationTimingFunction: `steps(${n}, end)`, transform: `translateY(${-n * 1.3}em)` }}>
        {reel.map((x, j) => (
          <span key={j} className="block h-[1.3em] leading-[1.3em]">
            {say(x)}
          </span>
        ))}
      </span>
    </span>
  );
}

function Word({ why, i }: { why: Why; i: number }) {
  const w = why.written!, s = w.steps[i], att = attentionOf(why, i);
  return (
    <>
      <SoFar w={w} i={i} />
      <p className={`${LABEL} opacity-70`}>LOOKING AT YOU</p>
      <p className="line-clamp-2 text-[0.8em] leading-[1.35]">
        {att.words.length === 0 && <span className="opacity-70">(their words stay private)</span>}
        {att.words.map((x, j) => (
          <Fragment key={j}>
            {j > 0 && " "}
            <span className={`px-[0.1em] ${LIT[x.level]}`}>{x.w}</span>
          </Fragment>
        ))}
      </p>
      <p className="text-[1.2em]">
        → <Reel s={s} />
      </p>
      <p className="flex items-center gap-[4%] text-[0.65em]">
        <Dots p={s.p} /> {pc(s.p)}
        {att.words.length > 0 && <> · {pc(att.sum)} on your words</>}
        {s.lesson > 0.005 && <span className="text-lemon">· {pc(s.lesson)} taught</span>}
      </p>
    </>
  );
}

/** Best of 8: a lane per reply he wrote (a block per word, lemon for a banned copy), its score, and his guard. */
function Best({ w }: { w: Written }) {
  return (
    <>
      <p className={`${LABEL} opacity-70`}>BEST OF {w.candidates.length}</p>
      <div className="text-[0.6em] leading-[1.1]">
        {w.candidates.map((c, i) => (
          <p key={i} className={`${ROW} ${i === w.chosen ? "" : "opacity-50"}`}>
            <span className="w-[0.8em]">{i === w.chosen ? "▶" : ""}</span>
            <span className="inline-flex gap-[0.15em]">
              {(c.words ?? []).map((_, j) => (
                <span key={j} className={`size-[0.45em] ${c.why === "copy" ? "bg-lemon" : "bg-current"}`} />
              ))}
            </span>
            <span className="ml-auto tabular-nums">{c.why === "ok" && c.score !== null ? c.score.toFixed(1) : c.why}</span>
          </p>
        ))}
      </div>
      <p className="text-[0.6em]">{w.admit || w.score === null ? "too unsure: he says he doesn't know" : `sure enough: ${w.score.toFixed(1)}, guard ${w.theta.toFixed(1)}`}</p>
    </>
  );
}

/** One page of a written reply on Ohm's screen: what he read, a word, or best of 8. */
export function WrittenPage({ why, page }: { why: Why; page: number }) {
  const w = why.written!;
  if (isWrittenBest(why, page)) return <Best w={w} />;
  // key: a new reel for every word, or React keeps the old one and its animation (which runs once) never replays.
  if (page > 0) return <Word key={page} why={why} i={page - 1} />;
  return (
    <>
      <p className={`${LABEL} opacity-70`}>{why.lesson ? "LESSON" : w.read.length ? "YOU SAID" : "SOMEONE SAID"}</p>
      <p className="line-clamp-2 text-[1.1em]">{w.read.length ? w.read.join(" ") : "(only they see it)"}</p>
      <p className="text-[0.75em]">
        {why.lesson ? `${why.lesson.count} people taught "${why.lesson.word}", weight ${pc(w.lambda)}` : `he writes ${w.candidates.length} replies, word by word`}
      </p>
    </>
  );
}
