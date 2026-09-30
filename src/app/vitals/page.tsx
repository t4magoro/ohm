"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart } from "@/components/charts/BarChart";
import { evenCeil } from "@/components/charts/ChartFrame";
import { StepChart } from "@/components/charts/StepChart";
import { PALETTE } from "@/components/pixel/palette";
import { Spellbook } from "@/components/sections/Spellbook";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Milestones } from "@/components/vitals/Milestones";
import { TopWords } from "@/components/vitals/TopWords";
import { dayAndMonth, dayAndTime, percent, weekday, whole } from "@/lib/format";
import type { Vitals } from "@/lib/protocol";
import { Understands } from "@/components/vitals/Understands";
import { SkillsCard } from "@/components/vitals/SkillsCard";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";
const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

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
    return { label: dayAndMonth(new Date(`${g.day}T12:00:00`).getTime()), value: total };
  });
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
    // One column on phones, two on desktop: each chart is its own card, so they tile.
    <main className="mx-auto grid w-full max-w-6xl flex-1 content-start items-start gap-6 px-4 py-6 lg:grid-cols-2">
      <header className="flex items-center justify-between lg:col-span-2">
        <h1 className="title-outline font-pixel text-2xl font-bold leading-none">Ohm&apos;s vitals</h1>
        <Link href="/" className="btn">
          back to Ohm
        </Link>
      </header>

      {failed ? (
        <p role="status" className="text-xl text-danger lg:col-span-2">
          <span className="text-mint">ohm&gt;</span> Couldn&apos;t reach Ohm. Try again in a moment.
        </p>
      ) : !data ? (
        // Placeholders in the shape of the cards to come, so the page doesn't jump when they arrive.
        [0, 1, 2, 3].map((i) => <CardSkeleton key={i} />)
      ) : (
        <>
          <Milestones progress={data.milestones} now={data.now} />
          <Spellbook brain={data.brain} />
          <SkillsCard snapshots={data.snapshots} skills={data.brain.skills} now={data.now} ticks={dayTicks(data.now)} />
          <Understands links={data.links} />
          {data.snapshots.length === 0 ? (
            <p className="card p-3 text-dim">No hourly readings yet: Ohm writes one down every hour.</p>
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
                fmtX={dayAndTime}
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
                fmtX={dayAndTime}
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

          <TopWords words={data.topWords} />
        </>
      )}
    </main>
  );
}
