// The sky's colors through Bandung's day. Between two stops the colors blend minute by minute,
// so the page never jumps from one scene to the next. Rain has its own grey colors.
import { bandungHour } from "./ohmState";
import type { Weather } from "./protocol";

/** [sepia, saturate, brightness, hue-rotate in degrees]: how the mountains or clouds are tinted. */
type Tint = [number, number, number, number];
/** `bands` run from the top of the sky down to the horizon. */
type Palette = { bands: string[]; screen: string; land: Tint; cloud: Tint };

const band = (color: string) => [color, color, color, color];
const NIGHT: Palette = { bands: band("#151827"), screen: "#cdd5f3", land: [0, 0.5, 0.35, 0], cloud: [0, 1, 1, 0] };
const SUNRISE: Palette = {
  bands: ["#a9b7f0", "#d4b4e6", "#f6b8c4", "#ffd3a8"],
  screen: "#fde3ec",
  land: [0.25, 1.25, 1, 0],
  cloud: [0.35, 1.5, 1, 0],
};
const DAY: Palette = { bands: band("#6ec1ee"), screen: "#fff8e7", land: [0, 1, 1, 0], cloud: [0, 1, 1, 0] };
const SUNSET: Palette = {
  bands: ["#3f3d80", "#7b4a94", "#c85a7c", "#f08a5d"],
  screen: "#ffcdb8",
  land: [0.5, 1.5, 0.75, -15],
  cloud: [1, 2, 0.95, -30],
};
const RAIN: Palette = { bands: band("#7f9db4"), screen: "#dfe7ef", land: [0, 0.5, 0.9, 0], cloud: [0, 0, 0.9, 0] };
const HOT_SCREEN = "#ffe2c4"; // over 30 °C the screen warms up, like the sun sprite

// [Bandung hour, palette]. Before the first stop and after the last it's night.
const STOPS: [number, Palette][] = [
  [5, NIGHT],
  [6, SUNRISE],
  [7.5, DAY],
  [16, DAY],
  [17.67, SUNSET],
  [18.67, NIGHT],
];

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mixColor = (a: string, b: string, t: number) => {
  const [x, y] = [rgb(a), rgb(b)];
  return `rgb(${x.map((v, i) => Math.round(mix(v, y[i], t))).join(" ")})`;
};
const filter = ([sepia, saturate, brightness, hue]: Tint) =>
  `sepia(${sepia}) saturate(${saturate}) brightness(${brightness}) hue-rotate(${hue}deg)`;

function paletteAt(hour: number): Palette {
  const i = STOPS.findIndex(([at]) => at > hour);
  if (i <= 0) return NIGHT; // before 05:00 or after 18:40
  const [[from, a], [to, b]] = [STOPS[i - 1], STOPS[i]];
  const t = (hour - from) / (to - from);
  return {
    bands: a.bands.map((c, k) => mixColor(c, b.bands[k], t)),
    screen: mixColor(a.screen, b.screen, t),
    land: a.land.map((v, k) => mix(v, b.land[k], t)) as Tint,
    cloud: a.cloud.map((v, k) => mix(v, b.cloud[k], t)) as Tint,
  };
}

/** The colors of the page and of Ohm's screen right now, ready for CSS. */
export function skyLook(w: Weather, now: number) {
  const p = w.isDay && w.raining ? RAIN : paletteAt(bandungHour(now));
  return {
    bands: p.bands,
    screen: w.isDay && !w.raining && w.tempC > 30 ? HOT_SCREEN : p.screen,
    land: filter(p.land),
    cloud: filter(p.cloud),
  };
}

export type SkyLook = ReturnType<typeof skyLook>;