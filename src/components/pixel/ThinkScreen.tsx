import { Fragment } from "react";
import {
  bestText,
  CHECK_LABEL,
  checks,
  END,
  isBest,
  isVerdict,
  lineOf,
  matchAt,
  NO_THOUGHTS,
  outcome,
  pagesOf,
  q,
  rows,
  screenLabel,
  soFar,
  START,
  startLabel,
  startNote,
  startText,
  stepAt,
  stepsOf,
  weight,
  wordsOf,
} from "@/content/thinking";
import type { Why } from "@/lib/protocol";
import { Dots } from "../ui/Dots";
import { BestScreen } from "./BestScreen";
import { PixelArt } from "./PixelArt";
import { SITUATION_ICONS } from "./sprites/situations";

const LABEL = "font-pixel text-[clamp(10px,3.2cqw,12px)]";

/** The sentence so far, at the top of a step's page: the new word slides in from the side it grew on. */
function Built({ why, page }: { why: Why; page: number }) {
  const { words, fresh, left } = soFar(why, page);
  return (
    <p className="line-clamp-2 text-[0.8em]">
      {words.map((w, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span className={i === fresh ? `inline-block bg-mint text-screen ${left ? "motion-safe:animate-in-left" : "motion-safe:animate-in-right"}` : "opacity-70"}>
            {w}
          </span>
        </Fragment>
      ))}
    </p>
  );
}

/**
 * One page of Ohm's thinking: page 0 is where he started, page i his step i - 1 (stepsOf: the words after it, then
 * before it), and best of 5 last.
 */
function Page({ why, page }: { why: Why; page: number }) {
  // A line's replay: the closest line, then each word you share sliding in as it's counted, the total growing.
  if (why.retrieved && !isVerdict(why, page)) {
    const { line, counted, word, total, all } = matchAt(why, page);
    const row = "flex items-center gap-[4%] px-[3%]";
    return (
      <>
        <p className={`${LABEL} opacity-70`}>{page === 0 ? "CLOSEST LINE" : "SHARED WORD"}</p>
        <p className="line-clamp-2 text-[0.8em]">
          {line.prompt.map((w, i) => (
            <Fragment key={i}>
              {i > 0 && " "}
              <span className={w === word?.[0] ? "inline-block bg-mint text-screen motion-safe:animate-in-right" : counted.has(w) ? "" : "opacity-70"}>{w}</span>
            </Fragment>
          ))}
        </p>
        <p className={row}>
          <span className={`w-[34%] shrink-0 ${LABEL}`}>{page === 0 ? "LESSON" : "WEIGHT"}</span>
          <span className="ml-auto">{page === 0 ? checks(why)[0].outcome : `+${weight(word[1])}`}</span>
        </p>
        <p className={`${row} bg-mint text-screen`}>
          <span className={`w-[34%] shrink-0 ${LABEL}`}>SHARED</span>
          <span className="ml-auto">{weight(total)}</span>
        </p>
        <p className="text-[1.2em]">→ {Math.round((total / all) * 100)}% covered</p>
      </>
    );
  }
  // His verdict: his checks as the rows a word's page has, under the line with the shared words lit.
  if (why.retrieved) {
    const line = lineOf(why);
    return (
      <>
        <p className={`${LABEL} opacity-70`}>{startLabel(why)}</p>
        {line && (
          <p className="line-clamp-1 text-[0.8em]">
            {line.prompt.map((w, i) => (
              <Fragment key={i}>
                {i > 0 && " "}
                <span className={line.matched.includes(w) ? "bg-mint text-screen" : "opacity-70"}>{w}</span>
              </Fragment>
            ))}
          </p>
        )}
        {checks(why).map((c) => (
          <p key={c.key} className={`flex items-center gap-[4%] px-[3%] ${c.yes ? "bg-mint text-screen" : ""}`}>
            <span className={`w-[34%] shrink-0 ${LABEL}`}>{CHECK_LABEL[c.key]}</span>
            {c.chance > 0 && <Dots p={c.chance} />}
            <span className="ml-auto">{c.outcome}</span>
          </p>
        ))}
        <p className="line-clamp-2 text-[1.2em]">→ {q(wordsOf(why).join(" "))}</p>
      </>
    );
  }
  if (page === 0) {
    const { from, situation, lift } = why.seed;
    return (
      <>
        <p className={`${LABEL} opacity-70`}>{startLabel(why)}</p>
        <p className="line-clamp-2 text-[1.4em]">{q(why.quote ? wordsOf(why).join(" ") : why.seed.word)}</p>
        {from === "situation" ? (
          <p className="flex items-center gap-[4%]">
            <PixelArt art={SITUATION_ICONS[situation!]} className="h-[0.8em] w-auto" />
            {lift!.toFixed(1)}× more in {situation}
          </p>
        ) : (
          <p>{startNote(why)}</p>
        )}
      </>
    );
  }
  if (isBest(why, page)) return <BestScreen why={why} />;
  const tried = rows(why, page - 1);
  const { word } = stepAt(why, page - 1).s;
  return (
    <>
      <Built why={why} page={page} />
      {(["pair", "word", "babble"] as const).map((rung) => {
        const r = tried.find((x) => x.rung === rung);
        const on = !!r && (rung === "babble" || r.yes); // the rung that made the word
        return (
          <p key={rung} className={`flex items-center gap-[4%] px-[3%] ${on ? "bg-mint text-screen" : r ? "" : "opacity-40"}`}>
            <span className={`w-[34%] shrink-0 ${LABEL}`}>{screenLabel(why, rung, page - 1)}</span>
            {r && r.chance > 0 && <Dots p={r.chance} />}
            <span className="ml-auto">{r ? outcome(r) : "·"}</span>
          </p>
        );
      })}
      <p className="text-[1.2em]">→ {word === END ? "(stop)" : word === START ? "(start)" : q(word)}</p>
    </>
  );
}

/**
 * Ohm's screen while he replays how he built a reply, one page per word (useThinking.ts runs the pages).
 * The pages are for the eyes; screen readers get the whole explanation as a list instead.
 */
export function ThinkScreen({ why, page }: { why?: Why; page: number }) {
  return (
    <div className="flex size-full flex-col bg-[#1d2b3a] text-mint">
      <p className="flex justify-between bg-ink/85 px-[5%] py-[2%] font-pixel text-[clamp(10px,4cqw,13px)] leading-none text-[#fff8e7]">
        <span>THINKING</span>
        {why && (
          <span className="tabular-nums">
            {page + 1}/{pagesOf(why)}
          </span>
        )}
      </p>
      <div aria-hidden className="flex min-h-0 flex-1 flex-col justify-center gap-[2%] px-[4%] text-[clamp(14px,5.2cqw,20px)] leading-[1.05]">
        {why ? <Page why={why} page={page} /> : <p className="text-center">{NO_THOUGHTS}</p>}
      </div>
      {why && (
        <ol className="sr-only" aria-label="How Ohm thought">
          <li>{startText(why)}</li>
          {stepsOf(why).map((_, i) => (
            <li key={i}>{rows(why, i).map((r) => r.text).join(" ")}</li>
          ))}
          {why.tries && <li>{bestText(why)}</li>}
        </ol>
      )}
    </div>
  );
}