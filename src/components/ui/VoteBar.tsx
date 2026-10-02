import type { Bar, Seg } from "@/content/maths";

// The same colours as the numbers in the sums (ThinkMaths.tsx).
const TONE: Record<Seg["tone"], string> = {
  pick: "bg-mint",
  kept: "bg-dim",
  votes: "bg-text/70",
  new: "bg-[repeating-linear-gradient(90deg,var(--color-pink)_0_2px,transparent_2px_4px)]", // stripes: not a word yet
  stop: "bg-pink",
  fill: "bg-lilac",
  rest: "bg-screen",
};

/**
 * Votes as one bar, a segment each, with a legend. The segments fill in toward the outcome, then the die is thrown
 * onto the bar where it really landed (pixel steps, like Ohm's hop); with reduced motion it just appears. Decorative:
 * the sums above it are the text.
 */
export function VoteBar({ bar, delay }: { bar: Bar; delay: number }) {
  const total = bar.segs.reduce((sum, s) => sum + s.size, 0);
  const wait = (ms: number) => ({ animationDelay: `${delay + ms}ms` });
  return (
    <div aria-hidden className="space-y-1">
      <div className="relative mt-2.5 flex h-3 border border-edge bg-screen">
        {bar.segs.map((s, i) => (
          <span
            key={i}
            className={`h-full origin-left not-last:border-r not-last:border-screen motion-safe:animate-grow ${TONE[s.tone]}`}
            style={{ width: `${(s.size / total) * 100}%`, ...wait(0) }}
          />
        ))}
        {bar.die && (
          <span
            className={`absolute -top-2.5 grid size-2.5 place-items-center border border-ink ${bar.die.second ? "bg-text" : "bg-lemon"} motion-safe:animate-throw motion-reduce:animate-fade`}
            style={{ left: `calc(${bar.die.at * 100}% - 5px)`, ...wait(320) }}
          >
            <span className="size-0.5 bg-ink" />
          </span>
        )}
      </div>
      <p className="flex flex-wrap gap-x-3 gap-y-0.5 font-pixel text-[10px] text-dim">
        {bar.segs
          .filter((s) => s.label)
          .map((s, i) => (
            <span key={i} className="flex items-center gap-1">
              <span className={`size-2 border border-edge ${TONE[s.tone]}`} />
              {s.label}
            </span>
          ))}
      </p>
      {bar.caption && <p className="text-lemon">{bar.caption}</p>}
    </div>
  );
}