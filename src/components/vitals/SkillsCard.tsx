"use client";

import { useState } from "react";
import { NO_SKILLS } from "@/content/vitals";
import { dayAndMonth, dayAndTime, percent } from "@/lib/format";
import type { Skills, Snapshot } from "@/lib/protocol";
import { Spark } from "../charts/Spark";
import { StepChart } from "../charts/StepChart";
import { PALETTE } from "../pixel/palette";

const HOUR = 3_600_000;
const WEEK = 7 * 24 * HOUR;
const SKILLS = ["words", "sentences", "context", "expression", "conversation"] as const;
// Not lemon or pink: those are charge and mood in the chart next door.
const COLORS: Record<keyof Skills, string> = {
  words: PALETTE.a,
  sentences: PALETTE.b,
  context: PALETTE.o,
  expression: PALETTE.v,
  conversation: PALETTE.w,
};

type View = "chart" | "tiles";
const percentOf = (v: number | null) => (v === null ? null : v * 100); // null: not measured yet, a gap in the line
const VIEW_KEY = "ohm-skills-view";

// The view you picked last time, per browser. localStorage can throw (private mode), so it's guarded.
function savedView(): View {
  try {
    return localStorage.getItem(VIEW_KEY) === "tiles" ? "tiles" : "chart";
  } catch {
    return "chart";
  }
}

type Props = { snapshots: Snapshot[]; skills: Skills; now: number; ticks: { x: number; label: string }[] };

/** Ohm's skills over the last 7 days, as one chart or as tiles: the visitor picks. */
export function SkillsCard({ snapshots, skills, now, ticks }: Props) {
  const [view, setView] = useState(savedView); // only rendered in the browser, after /vitals has loaded
  const measured = snapshots.filter((s) => s.skills !== null);
  if (measured.length === 0) return <p className="card p-3 text-dim">{NO_SKILLS}</p>;

  // Hours before brain v2 have no skills: they're left out, and the title says since when Ohm measures.
  const title = `Ohm's skills${measured.length < snapshots.length ? ` (measured since ${dayAndMonth(measured[0].at)})` : ", last 7 days"}`;
  const pick = (next: View) => {
    setView(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      // storage blocked: the choice lasts until the page reloads
    }
  };
  const toggle = (
    <span className="ml-auto flex shrink-0 gap-1 text-base">
      {(["chart", "tiles"] as const).map((v) => (
        <button key={v} type="button" aria-pressed={view === v} onClick={() => pick(v)} className={`term-btn ${view === v ? "text-lemon" : "text-dim"}`}>
          [{v}]
        </button>
      ))}
    </span>
  );

  if (view === "chart") {
    return (
      <StepChart
        title={title}
        actions={toggle}
        xs={measured.map((s) => s.at)}
        series={SKILLS.map((k) => ({ name: k, color: COLORS[k], values: measured.map((s) => percentOf(s.skills![k])) }))}
        from={now - WEEK}
        to={now}
        step={HOUR}
        yMax={100}
        ticks={ticks}
        fmtX={dayAndTime}
        fmtY={percent}
      />
    );
  }
  return (
    <section className="card space-y-2 p-3">
      <div className="flex items-center gap-2">
        <h2 className="font-pixel text-xs font-bold">{title}</h2>
        {toggle}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {SKILLS.map((k) => (
          <div key={k} className="space-y-1 bg-screen p-2 last:odd:col-span-2">
            <p className="font-pixel text-[10px] text-dim">{k}</p>
            <p className="text-3xl leading-none" style={{ color: COLORS[k] }}>
              {percent(skills[k] * 100)}
            </p>
            <Spark values={snapshots.map((s) => s.skills?.[k] ?? null)} color={COLORS[k]} />
          </div>
        ))}
      </div>
    </section>
  );
}