import { valueNow, type Stat } from "@/lib/protocol";

const PIPS = 10; // one pip per 10%, like HP in an RPG

/** `color` is a Tailwind background class, e.g. "bg-lemon". Below 20% every pip turns red. */
export function StatBar({ label, stat, now, color }: { label: string; stat: Stat; now: number; color: string }) {
  const value = valueNow(stat, now);
  const percent = Math.round(value);
  const lit = Math.ceil(value / (100 / PIPS));
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 bg-screen px-1.5 py-1 font-pixel text-[10px] leading-none">{label}</span>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="flex flex-1 gap-0.5 bg-screen p-0.5"
      >
        {Array.from({ length: PIPS }, (_, i) => (
          <span key={i} className={`h-3 flex-1 ${i >= lit ? "bg-edge" : percent < 20 ? "bg-danger" : color}`} />
        ))}
      </div>
      <span className="w-11 shrink-0 text-right text-2xl leading-none">{percent}%</span>
    </div>
  );
}
