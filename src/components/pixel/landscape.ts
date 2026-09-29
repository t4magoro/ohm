// Bandung's mountains, hills and a flowery field on a COLS × ROWS pixel grid, worked out like the
// portfolio's (components/pixel/landscape.ts). Computed once and turned into plain SVG paths.

export const COLS = 96;
export const ROWS = 32;
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

/** [path, color], painted back to front. Colors from the portfolio. */
export const LANDSCAPE: [string, string][] = [
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
