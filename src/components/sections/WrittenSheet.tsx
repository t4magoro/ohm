"use client";

import { Fragment, type ReactNode } from "react";
import { writtenMaths } from "@/content/maths";
import { litOf, madeText, typical, WEND, wordsOf } from "@/content/thinking";
import type { ChatItem } from "@/hooks/useOhm";
import type { Situation, Why } from "@/lib/protocol";
import { PixelArt } from "../pixel/PixelArt";
import { SITUATION_ICONS } from "../pixel/sprites/situations";
import { HowOhmThinks } from "./HowOhmThinks";
import { MathsToggle, ThinkMaths, useMaths } from "./ThinkMaths";

// The (!) sheet for a reply brain v4 wrote (why.written): pictures first, a short line each, the owner's pick from the
// prototype. Page 0: what he read. A word: where he looked, his top picks, the dice. Last: the 8 replies he wrote.
// Every number comes from `why`; the die lands where his roll really landed (step.die, sent by the API).
type Written = NonNullable<Why["written"]>;
type Step = Written["steps"][number];
const LABEL = "font-pixel text-[10px] uppercase tracking-wide";
const ROLL_MS = 900; // --animate-die-roll
const STRIPES = "bg-[repeating-linear-gradient(90deg,var(--color-pink)_0_2px,transparent_2px_5px)]";
const pc = (p: number) => (p > 0 && p < 0.01 ? "<1%" : `${Math.round(p * 100)}%`);
const say = (w: string) => (w === WEND ? "(stop)" : w);

/** Your words, each with a pixel bar as tall as his attention on it. Only the visitor he answered gets these. */
function Looked({ w, s }: { w: Written; s: Step }) {
  if (!w.read.length || !s.attn) return <p className="text-dim">Only the person Ohm answered sees which of their words he looked at.</p>;
  const a = s.attn, max = Math.max(...a, 1e-9), top = a.indexOf(max), sum = a.reduce((x, y) => x + y, 0);
  return (
    <>
      <div className="flex flex-wrap items-end gap-x-2.5 gap-y-1">
        {w.read.map((x, j) => (
          <span key={j} className="flex flex-col items-center">
            <span className="h-4 font-pixel text-[10px] leading-4 text-lemon">{j === top ? pc(a[j]) : ""}</span>
            <span aria-hidden className="flex h-6 items-end">
              <span
                className="w-3 origin-bottom bg-mint motion-safe:animate-bar-up"
                style={{ height: Math.max(1, Math.round((a[j] / max) * 6)) * 4, animationDelay: `${j * 40}ms` }}
              />
            </span>
            <span className={`mt-0.5 px-1 ${j === top ? "bg-text text-screen" : ""}`}>{x}</span>
          </span>
        ))}
      </div>
      <p className="mt-1 text-dim">{pc(sum)} of his attention was on your words. Where he looks isn&apos;t the whole reason.</p>
    </>
  );
}

/** His top 5 next words as poll bars, his word in mint (added when the dice picked one outside the top 5). */
function Picks({ s }: { s: Step }) {
  const rows: [string, number][] = s.top.some(([x]) => x === s.word) ? s.top : [...s.top.slice(0, 4), [s.word, s.p]];
  return (
    <div className="space-y-1">
      {rows.map(([x, p], j) => {
        const on = x === s.word;
        return (
          <p key={j} className="flex items-center gap-2">
            <span className={`w-24 shrink-0 truncate ${on ? "text-mint" : "text-text"}`}>{say(x)}</span>
            <span aria-hidden className="h-3 flex-1 bg-screen">
              <span className={`block h-full origin-left motion-safe:animate-grow ${on ? "bg-mint" : "bg-dim/60"}`} style={{ width: `${Math.max(1, p * 100)}%`, animationDelay: `${j * 50}ms` }} />
            </span>
            <span className={`w-10 shrink-0 text-right tabular-nums ${on ? "text-mint" : "text-dim"}`}>{pc(p)}</span>
          </p>
        );
      })}
    </div>
  );
}

/** Every word gets a slice as wide as its chance, likeliest first; the last 5% is skipped. The die tumbles in and lands
 *  where his roll landed, then that slice lights up. */
function Dice({ s }: { s: Step }) {
  const cut = s.cut ?? 0.95, die = s.die;
  const slices: { x: string; start: number; size: number; skipped: boolean }[] = [];
  let at = 0;
  for (const [x, p] of s.top) {
    slices.push({ x, start: at, size: p, skipped: at >= cut - 1e-6 });
    at += p;
  }
  const others = Math.max(0, cut - at), skipped = 1 - Math.max(cut, at);
  const hit = die === undefined ? -1 : slices.findIndex((c) => die >= c.start && die < c.start + c.size);
  return (
    <>
      <div aria-hidden className="relative mt-6 flex h-8 border-2 border-edge bg-screen">
        {slices.map((c, j) => (
          <span
            key={j}
            className={`relative h-full overflow-hidden border-r-2 border-screen ${c.skipped ? `${STRIPES} opacity-60` : j % 2 ? "bg-edge" : "bg-[#2c3352]"}`}
            style={{ width: `${c.size * 100}%` }}
          >
            {j === hit && <span className="absolute inset-0 bg-mint motion-safe:animate-fade [animation-fill-mode:both]" style={{ animationDelay: `${ROLL_MS}ms` }} />}
            {c.size > 0.12 && <span className={`relative block truncate px-1 leading-7 ${j === hit ? "text-screen" : "text-text"}`}>{say(c.x)}</span>}
          </span>
        ))}
        {others > 0.001 && <span className="h-full border-r-2 border-screen bg-[#2c3352]" style={{ width: `${others * 100}%` }} />}
        {skipped > 0.001 && <span className={`h-full ${STRIPES} opacity-60`} style={{ width: `${skipped * 100}%` }} />}
        <span className="absolute -top-1 bottom-[-4px] w-0.5 bg-lemon" style={{ left: `${cut * 100}%` }} />
        {die !== undefined && (
          <span
            className="absolute -top-6 grid size-4 grid-cols-2 place-items-center border-2 border-ink bg-lemon p-px motion-safe:animate-die-roll motion-reduce:animate-fade"
            style={{ left: `calc(${die * 100}% - 8px)` }}
          >
            <span className="size-1 bg-ink" />
            <span />
            <span />
            <span className="size-1 bg-ink" />
          </span>
        )}
      </div>
      <p className="mt-1 flex justify-between font-pixel text-[10px] text-dim">
        <span>likeliest first</span>
        <span className="text-lemon">he skips the last {pc(1 - cut)}</span>
      </p>
      <p className="mt-1">
        → <span className="bg-mint px-1 text-screen">{say(s.word)}</span>{" "}
        <span className="text-dim">
          ({pc(s.p)} chance{s.lesson > 0.005 ? `, ${pc(s.lesson)} of it taught by people` : ""})
        </span>
      </p>
    </>
  );
}

const STATE_NAMES = ["battery", "mood", "weather", "time"];
const STATE_ICON: Record<string, Situation | undefined> = { tipis: "battery_low", sedih: "mood_low", hujan: "rain", panas: "hot", pagi: "pagi", siang: "siang", sore: "sore", malam: "malam" };
/** Page 0: his state as chips, your words (only to you), and the lesson, if one fired. */
function Reads({ w, lesson }: { w: Written; lesson?: Why["lesson"] }) {
  return (
    <>
      {w.state && (
        <div className="grid grid-cols-2 gap-1.5">
          {w.state.map((v, i) => {
            const icon = STATE_ICON[v];
            return (
              <p key={i} className="flex items-center gap-2 border-2 border-edge px-2 py-0.5">
                <span className={`${LABEL} w-14 text-dim`}>{STATE_NAMES[i]}</span>
                {icon && <PixelArt art={SITUATION_ICONS[icon]} className="h-4 w-auto" />}
                <span>{v}</span>
              </p>
            );
          })}
        </div>
      )}
      <p className="mt-1.5 border-2 border-edge px-2 py-0.5">
        <span className={`${LABEL} text-dim`}>you said </span>
        {w.read.length ? w.read.join(" ") : <span className="text-dim">(only the sender sees this)</span>}
      </p>
      {lesson && (
        <p className="mt-1.5 border-2 border-lemon px-2 py-0.5 text-lemon">
          {lesson.count} people taught him what follows &quot;{lesson.word}&quot;: their words weigh {pc(w.lambda)}
        </p>
      )}
    </>
  );
}

/** The last page: every reply he wrote, surest first, with how sure he was of its words and why it lost. */
function Best({ w }: { w: Written }) {
  const guard = typical(w.theta);
  return (
    <>
      <ol className="space-y-2">
        {w.candidates
          .map((c, i) => ({ ...c, i, sure: c.score === null ? -1 : typical(c.score) }))
          .sort((a, b) => b.sure - a.sure)
          .map((c, rank) => {
            const on = c.i === w.chosen, tone = on ? "text-mint" : c.why === "copy" ? "text-lemon/80" : "text-text/70";
            return (
              <li key={c.i} className="motion-safe:animate-rise motion-reduce:animate-fade [animation-fill-mode:both]" style={{ animationDelay: `${rank * 60}ms` }}>
                <p className={`flex gap-2 leading-snug ${tone}`}>
                  <span className="w-3 shrink-0">{on ? "▶" : ""}</span>
                  <span className="min-w-0 flex-1">{c.words ? c.words.join(" ") : "(went on past 20 words)"}</span>
                  <span className="shrink-0 tabular-nums">{c.why === "ok" ? pc(c.sure) : c.why === "copy" ? "copy" : "too long"}</span>
                </p>
                <span aria-hidden className="relative ml-5 block h-1.5 bg-screen">
                  <span className={`block h-full origin-left motion-safe:animate-grow ${c.why === "copy" ? "bg-lemon" : on ? "bg-mint" : "bg-dim/60"}`} style={{ width: `${Math.max(0, c.sure) * 100}%`, animationDelay: `${rank * 60}ms` }} />
                  <span className="absolute -top-0.5 -bottom-0.5 w-0.5 bg-pink" style={{ left: `${guard * 100}%` }} />
                </span>
              </li>
            );
          })}
      </ol>
      <p className="mt-2 flex flex-wrap gap-x-3 font-pixel text-[10px] text-dim">
        <span><span className="mr-1 inline-block size-2 bg-mint" />how sure, per word</span>
        <span><span className="mr-1 inline-block size-2 bg-lemon" />a copy, set aside</span>
        <span><span className="mr-1 inline-block h-2 w-0.5 bg-pink" />needs {pc(guard)}</span>
      </p>
    </>
  );
}

function Row({ n, title, children }: { n?: number; title: string; children: ReactNode }) {
  return (
    <li className="relative pb-4 pl-5 motion-safe:animate-rise motion-reduce:animate-fade [animation-fill-mode:both]" style={{ animationDelay: `${(n ?? 1) * 60 - 60}ms` }}>
      <span className="absolute -left-[7px] top-1 size-3 bg-lemon" />
      <p className={`${LABEL} mb-1 text-lemon`}>
        {n ? `${n}. ` : ""}
        {title}
      </p>
      {children}
    </li>
  );
}

/** One page of the (!) sheet for a written reply. Re-mounted per page (ThinkSheet's key), so every page plays in. */
export function WrittenLadder({ line, page }: { line: ChatItem; page: number }) {
  const why = line.why!, w = why.written!, last = w.steps.length + 1;
  const s = page > 0 && page < last ? w.steps[page - 1] : null;
  const lit = litOf(why, page);
  const [maths, toggleMaths] = useMaths();
  const sum = maths ? writtenMaths(why, page) : null;
  return (
    <>
      <MathsToggle on={maths} onToggle={toggleMaths} />
      <p className="mb-3">
        {wordsOf(why).map((x, i) => (
          <Fragment key={i}>
            {i > 0 && " "}
            <span className={i === lit ? "bg-text text-screen" : undefined}>{x}</span>
          </Fragment>
        ))}
        <span className="text-dim"> to @{line.to}</span>
      </p>
      <ol className="ml-2 border-l-2 border-edge">
        {page === 0 && (
          <Row title="before he writes, he reads">
            <Reads w={w} lesson={why.lesson} />
            {sum && <ThinkMaths maths={sum} delay={60} explain={false} />}
          </Row>
        )}
        {s && (
          <>
            <Row n={1} title="where he looked">
              <Looked w={w} s={s} />
            </Row>
            <Row n={2} title="his top picks">
              <Picks s={s} />
            </Row>
            <Row n={3} title="the dice">
              <Dice s={s} />
              {sum && <ThinkMaths maths={sum} delay={ROLL_MS} explain={false} />}
            </Row>
          </>
        )}
        {page === last && (
          <Row title={`the ${w.candidates.length} replies he wrote, surest first`}>
            <Best w={w} />
            {sum && <ThinkMaths maths={sum} delay={60} explain={false} />}
          </Row>
        )}
        <li className="relative pl-5 text-lg">
          <span className="absolute -left-[7px] top-1.5 size-3 bg-text" />→ {madeText(why, page)}
        </li>
      </ol>
      <details className="group mt-3 text-base leading-snug text-dim">
        <summary className="cursor-pointer list-none text-lemon [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">[+] how ohm thinks</span>
          <span className="hidden group-open:inline">[-] how ohm thinks</span>
        </summary>
        <HowOhmThinks />
      </details>
    </>
  );
}
