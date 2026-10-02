"use client";

import { useState } from "react";
import { DIE_NOTE, type Maths, type Tone } from "@/content/maths";
import { VoteBar } from "../ui/VoteBar";

const KEY = "ohm-maths";
const STEP_MS = 140; // the steps print one after another, like a calculator
const enter = "motion-safe:animate-rise motion-reduce:animate-fade [animation-fill-mode:both]";
// The same colours as the bars: votes white, "something new" pink, kept lilac, the picked word mint, the die lemon.
const CHIP: Record<Tone, string> = {
  votes: "border-text/50 bg-text/10 text-text",
  new: "border-pink/70 bg-pink/15 text-pink",
  kept: "border-lilac/70 bg-lilac/15 text-lilac",
  pick: "border-mint/70 bg-mint/15 text-mint",
  die: "border-lemon bg-lemon text-ink",
  yes: "border-mint bg-mint text-ink",
  no: "border-pink bg-pink text-ink",
};

// "show the maths", per browser. localStorage can throw (private mode), so it's guarded.
function saved() {
  try {
    return localStorage.getItem(KEY) === "on";
  } catch {
    return false;
  }
}

/** Whether the (!) sheet shows Ohm's sums. Saved, because the sheet's ladder re-mounts on every page. */
export function useMaths() {
  const [on, setOn] = useState(saved);
  const toggle = () => {
    setOn(!on);
    try {
      if (on) localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, "on");
    } catch {
      // storage blocked: the choice lasts until the next page
    }
  };
  return [on, toggle] as const;
}

export function MathsToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button type="button" aria-pressed={on} onClick={onToggle} className="term-btn mb-2 text-base text-lemon">
      [{on ? "-" : "+"}] show the maths
    </button>
  );
}

// The bars start once every step is printed: each fills (320 ms), then its die lands (480 ms).
const barsMs = (bars: Maths["bars"]) => bars.reduce((ms, b) => ms + (b.die ? 800 : 320), 0);
const stepsMs = (maths: Maths) => 200 + maths.steps.length * STEP_MS;
/** How long one row's maths takes to play, so the next row waits for it. */
export const mathsMs = (maths: Maths) => stepsMs(maths) + barsMs(maths.bars);

/**
 * Ohm's sums for one row, opening out of the row it explains: a sentence saying what's counted, then the sum as a
 * printout (numbered steps, every number in its colour, printed one after another), then the bars, with his dice
 * thrown where they really landed. `explain`: the first die on the page says what a die is.
 */
export function ThinkMaths({ maths, delay, explain }: { maths: Maths; delay: number; explain: boolean }) {
  const wait = (ms: number) => ({ animationDelay: `${delay + ms}ms` });
  const barsFrom = delay + stepsMs(maths);
  return (
    <div className={`mt-1.5 space-y-1.5 ${enter}`} style={wait(0)}>
      <p className="leading-snug">{maths.intro}</p>
      <div className="space-y-1.5 border border-edge border-l-lemon border-l-2 bg-screen px-2 pt-1 pb-1.5">
        <p className="font-pixel text-[10px] text-lemon">the sum</p>
        <ol className="space-y-1">
          {maths.steps.map((step, i) => (
            <li key={i} className={`flex gap-2 ${enter}`} style={wait(200 + i * STEP_MS)}>
              <span className="mt-0.5 w-3 shrink-0 font-pixel text-[10px] text-dim">{i + 1}</span>
              <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 leading-snug">
                {step.map((tok, j) =>
                  tok.tone ? (
                    <span key={j} className={`border px-1 whitespace-nowrap ${CHIP[tok.tone]}`}>
                      {tok.text}
                    </span>
                  ) : (
                    <span key={j} className="text-dim">
                      {explain && i === maths.die && j === 0 ? DIE_NOTE : tok.text}
                    </span>
                  ),
                )}
              </p>
            </li>
          ))}
        </ol>
        {maths.bars.map((bar, i) => (
          <VoteBar key={i} bar={bar} delay={barsFrom + barsMs(maths.bars.slice(0, i))} />
        ))}
        {maths.formula && <p className="font-pixel text-[10px] text-dim">{maths.formula}</p>}
      </div>
    </div>
  );
}