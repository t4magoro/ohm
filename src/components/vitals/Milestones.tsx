import { dayAndMonth, whole } from "@/lib/format";
import { MILESTONES, type MilestoneProgress } from "@/lib/protocol";

const DAY = 24 * 3_600_000;

function Milestone({ p, now }: { p: MilestoneProgress; now: number }) {
  const m = MILESTONES.find((x) => x.id === p.id)!;
  const done = Math.min(100, p.done ? 100 : (p.value / m.goal) * 100);
  const value = m.counts === "days" ? p.value.toFixed(1) : whole(p.value);
  let eta: string;
  if (p.done) eta = `Unlocked: ${m.part}`;
  else if (p.etaDays === null) eta = m.counts === "days" ? "Ohm is off: the count starts again after a reboot" : "No progress in the last 7 days";
  else if (p.etaDays < 1) eta = "Any moment now!";
  else eta = `About ${Math.ceil(p.etaDays)} days to go (around ${dayAndMonth(now + p.etaDays * DAY)}) at this week's pace`;

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

/** Every milestone with its progress bar, reward and estimated finish. */
export function Milestones({ progress, now }: { progress: MilestoneProgress[]; now: number }) {
  return (
    <section className="card space-y-4 p-3">
      <h2 className="font-pixel text-sm font-bold">Milestones</h2>
      {progress.map((p) => (
        <Milestone key={p.id} p={p} now={now} />
      ))}
    </section>
  );
}
