import { END, NO_THOUGHTS, outcome, q, rows, SCREEN_LABEL, START_LABEL, startNote, startText, wordsOf } from "@/content/thinking";
import type { Why } from "@/lib/protocol";
import { Dots } from "../ui/Dots";
import { PixelArt } from "./PixelArt";
import { SITUATION_ICONS } from "./sprites/situations";

const LABEL = "font-pixel text-[clamp(10px,3.2cqw,12px)]";

/** One page of Ohm's thinking: page 0 is where he started, page i is how he got word i + 1. */
function Page({ why, page }: { why: Why; page: number }) {
  if (page === 0) {
    const { from, situation, lift } = why.seed;
    return (
      <>
        <p className={`${LABEL} opacity-70`}>{START_LABEL[from]}</p>
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
  const words = [why.seed.word, ...why.steps.map((s) => s.word)];
  const tried = rows(why, page - 1);
  const word = why.steps[page - 1].word;
  return (
    <>
      <p className="truncate">after {q(page > 1 ? `${words[page - 2]} ${words[page - 1]}` : words[0])}</p>
      {(["pair", "word", "babble"] as const).map((rung) => {
        const r = tried.find((x) => x.rung === rung);
        const on = !!r && (rung === "babble" || r.yes); // the rung that made the word
        return (
          <p key={rung} className={`flex items-center gap-[4%] px-[3%] ${on ? "bg-mint text-screen" : r ? "" : "opacity-40"}`}>
            <span className={`w-[34%] shrink-0 ${LABEL}`}>{SCREEN_LABEL[rung]}</span>
            {r && r.chance > 0 && <Dots p={r.chance} />}
            <span className="ml-auto">{r ? outcome(r) : "·"}</span>
          </p>
        );
      })}
      <p className="text-[1.2em]">→ {word === END ? "(stop)" : q(word)}</p>
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
            {page + 1}/{why.steps.length + 1}
          </span>
        )}
      </p>
      <div aria-hidden className="flex min-h-0 flex-1 flex-col justify-center gap-[2%] px-[4%] text-[clamp(14px,5.2cqw,20px)] leading-[1.05]">
        {why ? <Page why={why} page={page} /> : <p className="text-center">{NO_THOUGHTS}</p>}
      </div>
      {why && (
        <ol className="sr-only" aria-label="How Ohm thought">
          <li>{startText(why)}</li>
          {why.steps.map((_, i) => (
            <li key={i}>{rows(why, i).map((r) => r.text).join(" ")}</li>
          ))}
        </ol>
      )}
    </div>
  );
}