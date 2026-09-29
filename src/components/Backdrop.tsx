import { PixelArt } from "./pixel/PixelArt";

// Sprites copied from the portfolio (components/pixel/sprites/scene.ts).
const CLOUD = [
  ".........wwww...........",
  ".......wwwwwwww.........",
  "....wwwwwwwwwwwww.......",
  "..wwwwwwwwwwwwwwwwwww...",
  ".wwwwwwwwwwwwwwwwwwwwww.",
  "wwwwwwwwwwwwwwwwwwwwwwww",
  "wccwwwwwwwwwwwwwwwwwwccw",
  ".cccccccccccccccccccccc.",
];
const SPARKLE = ["..w..", "..w..", "ww.ww", "..w..", "..w.."];

// [left, top, width class]. They stand still on purpose: Ohm is the only thing on the page that moves.
const CLOUDS: [string, string, string][] = [
  ["-4%", "6%", "w-44"],
  ["72%", "18%", "w-32"],
  ["6%", "46%", "w-28"],
  ["80%", "64%", "w-40"],
  ["-2%", "86%", "w-36"],
];
const STARS: [string, string, string][] = [
  ["4%", "8%", "w-4"],
  ["18%", "22%", "w-2"],
  ["30%", "6%", "w-3"],
  ["63%", "5%", "w-5"],
  ["79%", "18%", "w-3"],
  ["93%", "9%", "w-4"],
  ["8%", "52%", "w-3"],
  ["95%", "46%", "w-2"],
  ["3%", "86%", "w-5"],
  ["22%", "93%", "w-2"],
  ["74%", "84%", "w-2"],
  ["90%", "92%", "w-4"],
];

// Gedung Sate, Bandung's landmark, 61 × 26 pixels: the "sate" spire, three roof tiers and two long wings.
// Worked out, not drawn, like the egg in Device.tsx. "w" marks a window.
function gedungSate() {
  const W = 61;
  const H = 26;
  const c = 30; // the middle column
  const g = Array.from({ length: H }, () => Array<string>(W).fill("."));
  const fill = (x0: number, y0: number, x1: number, y1: number, ch = "k") => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = ch;
  };
  fill(c, 0, c, 11); // the skewer
  for (const y of [2, 4, 6, 8]) fill(c - 1, y, c + 1, y); // its beads
  for (const [y, half] of [[11, 2], [13, 4], [15, 6]]) {
    fill(c - half, y, c + half, y); // each roof tier flares out at the eaves
    fill(c - half - 1, y + 1, c + half + 1, y + 1);
  }
  fill(c - 6, 17, c + 6, H - 1); // the tower
  fill(1, 19, W - 2, 19); // the wings' roof
  fill(2, 20, W - 3, H - 1); // the wings
  for (let x = 4; x < c - 8; x += 3) fill(x, 21, x, 22, "w");
  for (let x = c + 9; x < W - 3; x += 3) fill(x, 21, x, 22, "w");
  for (const x of [c - 4, c - 2, c + 2, c + 4]) fill(x, 19, x, 20, "w");
  fill(c - 1, 21, c + 1, H - 1, "w"); // the door
  return g.map((row) => row.join(""));
}
const GEDUNG_SATE = gedungSate();

/** The bottom of the page. Its windows light up at night. Decoration only. */
export function Skyline({ lit }: { lit: boolean }) {
  return <PixelArt art={GEDUNG_SATE.map((row) => row.replaceAll("w", lit ? "y" : "."))} className="block w-full" />;
}

export type SkyName = "day" | "rain" | "night";

/** Behind the whole page: clouds by day, stars at night. Decoration only. */
export function Backdrop({ sky }: { sky: SkyName }) {
  const night = sky === "night";
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {(night ? STARS : CLOUDS).map(([left, top, size]) => (
        <PixelArt
          key={left + top}
          art={night ? SPARKLE : CLOUD}
          className={`absolute ${size} ${sky === "rain" ? "opacity-60" : ""}`}
          style={{ left, top }}
        />
      ))}
    </div>
  );
}
