/** A tiny staircase of one value over time (0 to 1), no axes. `null` leaves a gap: not measured. */
export function Spark({ values, color }: { values: (number | null)[]; color: string }) {
  const x = (i: number) => (i / Math.max(1, values.length - 1)) * 100;
  const y = (v: number) => 23 - v * 22;
  const d = values
    .map((v, i) => (v === null ? "" : i > 0 && values[i - 1] !== null ? `H${x(i)}V${y(v)}` : `M${x(i)} ${y(v)}`))
    .join("");
  return (
    <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="h-6 w-full" aria-hidden>
      <line x1="0" x2="100" y1="23" y2="23" stroke="currentColor" className="opacity-20" />
      <path d={d} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}