"use client";

import { Fragment, useEffect, useRef } from "react";
import { rowMaths, startMaths } from "@/content/maths";
import { firstTitle, LEGEND, litOf, madeText, outcome, pageTitle, rows, startText, wordsOf } from "@/content/thinking";
import type { ChatItem } from "@/hooks/useOhm";
import { odds } from "@/lib/format";
import { Dots } from "../ui/Dots";
import { MathsToggle, mathsMs, ThinkMaths, useMaths } from "./ThinkMaths";

type Props = { line: ChatItem; page: number; open: boolean; onClose: () => void; className?: string };

/** The ladder for one word: what Ohm tried, in order, the rail lit where it worked. Rows come in one by one. */
function Ladder({ line, page }: { line: ChatItem; page: number }) {
  const why = line.why!;
  const list = page === 0 ? [] : rows(why, page - 1);
  const lit = litOf(why, page);
  const enter = "motion-safe:animate-rise motion-reduce:animate-fade [animation-fill-mode:both]";
  const delay = (i: number) => ({ animationDelay: `${i * 60}ms` });
  const [maths, toggleMaths] = useMaths();
  const start = maths && page === 0 ? startMaths(why) : null;
  const sums = list.map((r) => (maths ? rowMaths(why, page - 1, r) : null));
  // One row's maths after the other's, never all at once. The first die on the page says what a die is.
  const wait = (i: number) => 60 + sums.slice(0, i).reduce((ms, m) => ms + (m ? mathsMs(m) : 0), 0);
  const firstDie = sums.findIndex((m) => m?.die !== undefined);

  return (
    <>
      <MathsToggle on={maths} onToggle={toggleMaths} />
      <p className="mb-2">
        {wordsOf(why).map((w, i) => (
          <Fragment key={i}>
            {i > 0 && " "}
            <span className={i === lit ? "bg-text text-screen" : undefined}>{w}</span>
          </Fragment>
        ))}
        <span className="text-dim"> to @{line.to}</span>
      </p>
      <ol className="ml-2 border-l-2 border-edge">
        {page === 0 && (
          <li className={`relative pb-3 pl-5 ${enter}`}>
            <span className="absolute -left-[7px] top-1.5 size-3 bg-lemon" />
            <p className="font-pixel text-[10px] text-lemon">{firstTitle(why)}</p>
            <p className="leading-snug">{startText(why)}</p>
            {start && <ThinkMaths maths={start} delay={60} explain />}
          </li>
        )}
        {list.map((r, i) => (
          <li key={i} className={`relative pb-3 pl-5 ${enter}`} style={delay(i)}>
            <span className={`absolute -left-[7px] top-1.5 size-3 ${r.yes || r.rung === "babble" ? "bg-mint" : "bg-edge"}`} />
            <p className="font-pixel text-[10px] text-dim">
              {i + 1}. {r.title}
            </p>
            {r.chance > 0 && (
              <p className="flex items-center gap-2 text-lemon">
                <Dots p={r.chance} />
                {odds(r.chance).label}
                <span className={r.yes ? "text-mint" : "text-pink"}>{outcome(r)}</span>
              </p>
            )}
            <p className="leading-snug">{r.text}</p>
            {sums[i] && <ThinkMaths maths={sums[i]} delay={wait(i)} explain={i === firstDie} />}
          </li>
        ))}
        <li className={`relative pl-5 text-lg ${enter}`} style={delay(list.length)}>
          <span className="absolute -left-[7px] top-1.5 size-3 bg-text" />→ {madeText(why, page)}
        </li>
      </ol>
      <details className="group mt-3 text-base leading-snug text-dim">
        <summary className="cursor-pointer list-none text-lemon [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">[+] how ohm thinks</span>
          <span className="hidden group-open:inline">[-] how ohm thinks</span>
        </summary>
        <p className="mt-1">{LEGEND}</p>
      </details>
    </>
  );
}

/**
 * What (!) opens while Ohm replays a reply: the page he's on, explained. Stays mounted so it can slide out the
 * way it came (.sheet in components.css). prev and next on the toy keep working, and the sheet follows them.
 */
export function ThinkSheet({ line, page, open, onClose, className = "" }: Props) {
  const sheet = useRef<HTMLElement>(null);

  // Focus moves into the sheet, and Escape closes it, like any dialog.
  useEffect(() => {
    if (!open) return;
    sheet.current?.focus({ preventScroll: true }); // the closed sheet sits below the edge: never scroll to it
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, [open, onClose]);

  return (
    <section
      ref={sheet}
      tabIndex={-1}
      role="dialog"
      aria-label="How Ohm picked this word"
      inert={!open}
      data-open={open || undefined}
      className={`sheet term z-20 flex min-h-0 flex-col outline-none ${className}`}
    >
      <h2 className="term-bar">
        <span>{pageTitle(line.why!, page)}</span>
        <button type="button" className="term-btn absolute right-1.5 bg-screen" onClick={onClose} aria-label="Close">
          [x]
        </button>
      </h2>
      <div className="scroll-quiet min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2">
        {/* Re-mounts per page, so each page's rows come in one after another. */}
        <Ladder key={`${line.key}-${page}`} line={line} page={page} />
      </div>
    </section>
  );
}