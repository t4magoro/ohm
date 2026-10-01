// Numbers and dates the way the pages show them.

const HOUR = 3_600_000;

/** 45_000_000 → "12.5h" */
export const hours = (ms: number) => `${(ms / HOUR).toFixed(1)}h`;

/** (1, "word") → "1 word", (3, "word") → "3 words" */
export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export const percent = (v: number) => `${Math.round(v)}%`;

/** A chance as the nearest "n in d" with d up to 10: 0.4 → 2 in 5, 0.18 → about 1 in 6. */
export function odds(p: number) {
  let best = { n: 1, d: 2, err: Infinity };
  for (let d = 2; d <= 10; d++) {
    const n = Math.min(d - 1, Math.max(1, Math.round(p * d)));
    const err = Math.abs(n / d - p);
    if (err < best.err - 1e-9) best = { n, d, err };
  }
  return { n: best.n, d: best.d, label: `${best.err > 0.004 ? "about " : ""}${best.n} in ${best.d}` };
}
export const whole = (v: number) => Math.round(v).toLocaleString();

/** "Tue" */
export const weekday = (at: number) => new Date(at).toLocaleDateString([], { weekday: "short" });
/** "Tue 14:00": a point on a chart */
export const dayAndTime = (at: number) => new Date(at).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" });
/** "29 Sep" */
export const dayAndMonth = (at: number) => new Date(at).toLocaleDateString([], { day: "numeric", month: "short" });
/** local bandung time, wherever the visitor is: Ohm's clock */
export const bandungClock = (at: number) =>
  new Date(at).toLocaleTimeString("en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" });
/** "29 Sep 2026, 14:00": when something happened, on the admin page */
export const dateAndTime = (at: number) => new Date(at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
/** "14:05": a line in the feed */
export const timeOfDay = (at: number) => new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
