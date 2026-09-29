"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart, evenCeil, StepChart } from "@/components/Charts";
import { PALETTE } from "@/components/pixel/palette";
import { Spellbook } from "@/components/Spellbook";
import { MILESTONES, type MilestoneProgress, type Vitals } from "@/lib/protocol";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";
const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

const weekday = (at: number) => new Date(at).toLocaleDateString([], { weekday: "short" });
const when = (at: number) => new Date(at).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" });
const date = (at: number) => new Date(at).toLocaleDateString([], { day: "numeric", month: "short" });
const percent = (v: number) => `${Math.round(v)}%`;
const whole = (v: number) => Math.round(v).toLocaleString();

/** One label per day, in the middle of each of the last 7 days (local time). */
function dayTicks(now: number) {
  const midnight = new Date(now).setHours(0, 0, 0, 0);
  return Array.from({ length: 8 }, (_, k) => midnight - k * DAY + DAY / 2)
    .filter((x) => x > now - WEEK && x < now)
    .map((x) => ({ x, label: weekday(x) }));
}

/** Words learned per day → words known at the end of each day. */
function known(growth: Vitals["growth"]) {
  let total = 0;
  return growth.map((g) => {
    total += g.words;
    return { label: date(new Date(`${g.day}T12:00:00`).getTime()), value: total };
  });
}

function Milestone({ p, now }: { p: MilestoneProgress; now: number }) {
  const m = MILESTONES.find((x) => x.id === p.id)!;
  const done = Math.min(100, p.done ? 100 : (p.value / m.goal) * 100);
  const value = m.counts === "days" ? p.value.toFixed(1) : whole(p.value);
  let eta: string;
  if (p.done) eta = `Unlocked: ${m.part}`;
  else if (p.etaDays === null) eta = m.counts === "days" ? "Ohm is off: the count starts again after a reboot" : "No progress in the last 7 days";
  else if (p.etaDays < 1) eta = "Any moment now!";
  else eta = `About ${Math.ceil(p.etaDays)} days to go (around ${date(now + p.etaDays * DAY)}) at this week's pace`;

  return (
    <div className="space-y-1">
      <div className="flex justify-between gap-3">
        <span>{m.goalText}</span>
        <span className="whitespace-nowrap tabular-nums">{p.done ? "done" : `${value} / ${m.goal.toLocaleString()}`}</span>
      </div>
      <div
        role="progressbar"
        aria-label={m.goalText}
        aria-valuenow={Math.round(done)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-3 overflow-hidden border-2 border-edge bg-background"
      >
        <div className="h-full bg-mint" style={{ width: `${done}%` }} />
      </div>
      <p className="text-base text-dim">{p.done ? eta : `Reward: ${m.part} · ${eta}`}</p>
    </div>
  );
}

export default function VitalsPage() {
  const [data, setData] = useState<Vitals | null>(null);
  const [failed, setFailed] = useState(false);

  // One request per visit. The API recalculates the numbers every 5 minutes anyway.
  useEffect(() => {
    let live = true;
    fetch(`${API}/vitals`)
      .then((res) => (res.ok ? (res.json() as Promise<Vitals>) : Promise.reject(new Error(`${res.status}`))))
      .then((v) => live && setData(v))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-4 py-5">
      <header className="flex items-center justify-between">
        <h1 className="title-outline font-pixel text-2xl font-bold leading-none">Ohm&apos;s vitals</h1>
        <Link href="/" className="btn">
          back to Ohm
        </Link>
      </header>

      {!data ? (
        <p className="text-xl">
          <span className="text-mint">ohm&gt;</span>{" "}
          {failed ? "Couldn't reach Ohm. Try again in a moment." : "reading Ohm's vitals..."}
        </p>
      ) : (
        <>
          <section className="card space-y-4 p-3">
            <h2 className="font-pixel text-sm font-bold">Milestones</h2>
            {data.milestones.map((p) => (
              <Milestone key={p.id} p={p} now={data.now} />
            ))}
          </section>

          <Spellbook brain={data.brain} />

          {data.snapshots.length === 0 ? (
            <p className="text-dim">No hourly readings yet: Ohm writes one down every hour.</p>
          ) : (
            <>
              <StepChart
                title="Charge and mood, last 7 days"
                xs={data.snapshots.map((s) => s.at)}
                series={[
                  { name: "Charge", color: PALETTE.y, values: data.snapshots.map((s) => s.charge) },
                  { name: "Mood", color: PALETTE.r, values: data.snapshots.map((s) => s.mood) },
                ]}
                from={data.now - WEEK}
                to={data.now}
                step={HOUR}
                yMax={100}
                ticks={dayTicks(data.now)}
                fmtX={when}
                fmtY={percent}
              />
              <StepChart
                title="Visitors online, last 7 days"
                xs={data.snapshots.map((s) => s.at)}
                series={[{ name: "Online", color: PALETTE.a, values: data.snapshots.map((s) => s.online) }]}
                from={data.now - WEEK}
                to={data.now}
                step={HOUR}
                yMax={evenCeil(Math.max(...data.snapshots.map((s) => s.online)))}
                ticks={dayTicks(data.now)}
                fmtX={when}
                fmtY={whole}
              />
            </>
          )}

          <BarChart
            title="Busiest hours, last 7 days (Bandung time)"
            bars={data.hours.map((n, h) => ({ label: String(h).padStart(2, "0"), value: n }))}
            fmt={whole}
          />

          {data.growth.length > 0 && (
            <BarChart title="Words Ohm knows (last 14 days with new words)" bars={known(data.growth).slice(-14)} fmt={whole} />
          )}

          <section className="space-y-2">
            <h2 className="font-pixel text-sm font-bold">Top words</h2>
            {data.topWords.length === 0 ? (
              <p className="text-dim">Ohm hasn&apos;t learned any words yet.</p>
            ) : (
              <table className="term w-full">
                <thead className="text-left text-dim">
                  <tr>
                    <th className="font-normal">Word</th>
                    <th className="font-normal">Typed</th>
                    <th className="font-normal">Ohm said it</th>
                    <th className="font-normal">Taught by</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topWords.map((w) => (
                    <tr key={w.word}>
                      <td>{w.word}</td>
                      <td>{w.uses}×</td>
                      <td>{w.said}×</td>
                      <td>{w.by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </main>
  );
}