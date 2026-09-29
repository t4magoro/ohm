// Bandung's sky on Ohm's screen: sun or moon, stars, a cloud and falling rain (see Sky.tsx).
// Each letter is a color from ../palette.ts, "." is transparent. Placeholders: redraw them!

export const SUN = [
  "......k......",
  "..k...k...k..",
  "...k.....k...",
  ".....kkk.....",
  "....kyyyk....",
  "...kyyyyyk...",
  "kk.kyyyyyk.kk",
  "...kyyyyyk...",
  "....kyyyk....",
  ".....kkk.....",
  "...k.....k...",
  "..k...k...k..",
  "......k......",
];
export const HOT_SUN = SUN.map((row) => row.replace(/[ky]/g, "o")); // over 30 °C: the battery drains faster

export const MOON = [
  "...kkkk....",
  "..kyyk.....",
  ".kyyk......",
  ".kyk.......",
  "kyyk.......",
  "kyyk.......",
  "kyyk.......",
  ".kyk.......",
  ".kyyk......",
  "..kyyk.....",
  "...kkkk....",
];

export const STARS = [
  "..........y.........",
  ".........yyy........",
  "..........y.....y...",
  "...............yyy..",
  "..y..............y..",
  ".yyy................",
  "..y.................",
];

export const CLOUD = [
  ".....kkkk.....",
  "...kkwwwwk....",
  "..kwwwwwwwkk..",
  ".kwwwwwwwwwwk.",
  "kwwwwwwwwwwwwk",
  "kcccccccccccck",
  ".kkkkkkkkkkkk.",
];

// Raindrops 2 pixels tall, scattered by a fixed rule so the pattern is the same on every visit.
export const RAIN = Array.from({ length: 48 }, (_, y) =>
  Array.from({ length: 40 }, (_, x) => ((x * 7 + Math.floor(y / 2) * 11) % 23 === 0 ? "u" : ".")).join(""),
);
