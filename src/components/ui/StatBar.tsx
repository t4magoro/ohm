const PIPS = 10; // one pip per 10%, like HP in an RPG

type Props = {
  label: string;
  /** 0 to 100. */
  value: number;
  /** A Tailwind background class, e.g. "bg-lemon". */
  color: string;
  /** Every pip turns red below 20%: for charge and mood, not for skills that start at 0. */
  alarm?: boolean;
  /** Room for longer labels, like "expression". */
  wide?: boolean;
};

/** A stat as a row of pips, with its label and percent. */
export function StatBar({ label, value, color, alarm = false, wide = false }: Props) {
  const percent = Math.round(value);
  const lit = Math.ceil(value / (100 / PIPS));
  const fill = alarm && percent < 20 ? "bg-danger" : color;
  return (
    <div className="flex items-center gap-2">
      <span className={`${wide ? "w-24" : "w-16"} shrink-0 bg-screen px-1.5 py-1 font-pixel text-[10px] leading-none`}>{label}</span>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="flex flex-1 gap-0.5 bg-screen p-0.5"
      >
        {Array.from({ length: PIPS }, (_, i) => (
          <span key={i} className={`h-3 flex-1 ${i >= lit ? "bg-edge" : fill}`} />
        ))}
      </div>
      <span className="w-11 shrink-0 text-right text-2xl leading-none">{percent}%</span>
    </div>
  );
}
