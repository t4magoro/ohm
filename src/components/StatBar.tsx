import { valueNow, type Stat } from "@/lib/protocol";

export function StatBar({ label, stat, now }: { label: string; stat: Stat; now: number }) {
  const value = valueNow(stat, now);
  const percent = Math.round(value);
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-3 overflow-hidden rounded border-2 border-current"
      >
        <div
          className={`h-full motion-safe:transition-[width] motion-safe:duration-1000 ${percent < 20 ? "bg-red-500" : "bg-green-500"}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}