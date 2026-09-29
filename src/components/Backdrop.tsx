import { PixelArt } from "./pixel/PixelArt";

export type SkyName = "day" | "rain" | "night";

// Sprites copied from the portfolio (components/pixel/sprites/scene.ts), plus a bird and a shooting star.
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
const BIRD_UP = ["k.....k", ".k...k.", "..kkk..", "......."];
const BIRD_DOWN = [".......", "..kkk..", ".k...k.", "k.....k"];
const SHOOTING_STAR = ["......ww", "....ww..", "..yy....", "wy......"];

// [top, width class, left when motion is reduced, seconds to cross, start part-way (negative delay)].
// Bigger clouds are nearer, so they cross faster: a little parallax for free.
const CLOUDS: [string, string, string, number, number][] = [
  ["5%", "w-44", "-4vw", 70, -10],
  ["15%", "w-24", "70vw", 110, -60],
  ["26%", "w-32", "20vw", 90, -35],
  ["9%", "w-20", "45vw", 130, -95],
  ["36%", "w-28", "82vw", 100, -75],
];
// [left, top, size class, twinkle delay]. Mixed sizes make the sky look deeper.
const STARS: [string, string, string, string][] = [
  ["4%", "8%", "w-4", "0s"],
  ["18%", "22%", "w-2", "0.7s"],
  ["30%", "6%", "w-3", "1.2s"],
  ["46%", "14%", "w-2", "0.3s"],
  ["63%", "5%", "w-5", "0.9s"],
  ["79%", "18%", "w-3", "1.5s"],
  ["93%", "9%", "w-4", "0.5s"],
  ["8%", "34%", "w-3", "1.1s"],
  ["88%", "32%", "w-2", "0.2s"],
  ["55%", "28%", "w-2", "0.6s"],
];

// The landscape, worked out like the portfolio's (components/pixel/landscape.ts), on a COLS × ROWS grid.
const COLS = 96;
const ROWS = 32;
const FIELD = 6; // field height in pixels
const SNOW_LINE = 17; // mountain pixels above this height are snow
// [column, height, half-width of a flat top]. The flat one in the middle is Tangkuban Perahu, Bandung's
// "upturned boat" volcano.
const MOUNTAIN_PEAKS: [number, number, number][] = [[8, 21, 0], [27, 15, 0], [48, 19, 7], [70, 16, 0], [88, 22, 0]];
const HILL_PEAKS: [number, number, number][] = [[0, 11, 0], [20, 13, 0], [41, 10, 0], [60, 12, 0], [80, 14, 0], [96, 11, 0]];

const rect = (x: number, y: number, w: number, h: number) => `M${x} ${y}h${w}v${h}h${-w}z`;

/** Sunny side, shaded side and snow caps of a range. `slope` = pixels lost per column away from a peak. */
function drawRidge(peaks: [number, number, number][], slope: number, snowLine = Infinity) {
  let lit = "";
  let shade = "";
  let snow = "";
  for (let x = 0; x < COLS; x++) {
    let best = { h: 0, shaded: false };
    for (const [px, ph, flat] of peaks) {
      const h = Math.round(ph - Math.max(0, Math.abs(x - px) - flat) * slope);
      if (h > best.h) best = { h, shaded: x > px };
    }
    const column = rect(x, ROWS - best.h, 1, best.h);
    if (best.shaded) shade += column;
    else lit += column;
    if (best.h > snowLine) snow += rect(x, ROWS - best.h, 1, Math.min(2, best.h - snowLine));
  }
  return { lit, shade, snow };
}

/** The field: grass tufts on top and flowers scattered by a fixed rule (the same on every visit). */
function drawField() {
  const top = ROWS - FIELD;
  let grass = "";
  let pink = "";
  let yellow = "";
  for (let x = 0; x < COLS; x++) {
    if ((x * 5) % 7 < 3) grass += rect(x, top - 1, 1, 1);
    if ((x * 13) % 17 < 2) pink += rect(x, ROWS - 2 - (x % 3), 1, 1);
    if ((x * 7) % 19 < 2) yellow += rect(x, ROWS - 1 - (x % 2) * 2, 1, 1);
  }
  return { base: rect(0, top, COLS, FIELD) + grass, stripes: rect(0, top + 2, COLS, 1) + rect(0, top + 4, COLS, 1), pink, yellow };
}

const mountains = drawRidge(MOUNTAIN_PEAKS, 1, SNOW_LINE);
const hills = drawRidge(HILL_PEAKS, 0.5);
const field = drawField();
// [path, color], painted back to front. Colors from the portfolio.
const LANDSCAPE: [string, string][] = [
  [mountains.lit, "#8a9bd6"],
  [mountains.shade, "#6f80c4"],
  [mountains.snow, "#ffffff"],
  [hills.lit, "#3f9e45"],
  [hills.shade, "#34873a"],
  [field.base, "#5bc24a"],
  [field.stripes, "#52b441"],
  [field.pink, "#f54ba3"],
  [field.yellow, "#fff15c"],
];

// The same landscape by night or in the rain: darker, greyer.
const LANDSCAPE_TINT: Record<SkyName, string> = { day: "", rain: "saturate-50 brightness-90", night: "saturate-50 brightness-[0.35]" };

/**
 * Behind the whole page: drifting clouds and a bird by day, twinkling stars and a shooting star at night,
 * and Bandung's mountains along the ground. Decoration only; everything stands still with reduced motion.
 * On phones the ground sits just above the bottom console (--console-top, set on <main>).
 */
export function Backdrop({ sky }: { sky?: SkyName }) {
  const night = sky === "night";
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {night &&
        STARS.map(([left, top, size, delay]) => (
          <PixelArt
            key={left + top}
            art={SPARKLE}
            className={`absolute ${size} motion-safe:animate-twinkle`}
            style={{ left, top, animationDelay: delay }}
          />
        ))}
      {night && (
        <div className="absolute right-[8%] top-[6%] hidden motion-safe:block motion-safe:animate-shoot">
          <PixelArt art={SHOOTING_STAR} className="w-10" />
        </div>
      )}

      {sky &&
        !night &&
        CLOUDS.map(([top, size, left, seconds, delay]) => (
          <div
            key={top}
            className="absolute left-0 motion-safe:animate-drift"
            // Rain clouds hurry across; the static left is where each cloud rests with reduced motion.
            style={{ top, transform: `translateX(${left})`, animationDuration: `${sky === "rain" ? seconds / 2 : seconds}s`, animationDelay: `${delay}s` }}
          >
            <PixelArt art={CLOUD} className={`${size} ${sky === "rain" ? "brightness-90 grayscale" : ""}`} />
          </div>
        ))}

      {sky === "day" && (
        // A pair of birds crossing now and then, flapping in two frames.
        <div className="absolute left-0 top-[12%] hidden motion-safe:flex motion-safe:animate-fly">
          {[0, 1].map((i) => (
            <div key={i} className="relative w-5" style={{ marginTop: i * 10 }}>
              <PixelArt art={BIRD_UP} className="w-full motion-safe:animate-flap" />
              <PixelArt art={BIRD_DOWN} className="absolute inset-0 w-full motion-safe:animate-flap [animation-delay:-0.2s]" />
            </div>
          ))}
        </div>
      )}

      <svg
        viewBox={`0 0 ${COLS} ${ROWS}`}
        preserveAspectRatio="xMidYMax slice"
        shapeRendering="crispEdges"
        className={`absolute inset-x-0 bottom-[var(--console-top,0px)] h-[24dvh] w-full transition-[filter] duration-1000 lg:bottom-0 lg:h-[38vh] ${sky ? LANDSCAPE_TINT[sky] : LANDSCAPE_TINT.night}`}
      >
        {LANDSCAPE.map(([d, color]) => (
          <path key={color} d={d} fill={color} />
        ))}
      </svg>
    </div>
  );
}
