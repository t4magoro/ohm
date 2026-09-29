import type { Weather } from "@/lib/protocol";
import { PixelArt } from "./pixel/PixelArt";

// Bandung's sky behind Ohm: sun or moon, a cloud and falling rain.
// Decoration only: the line under the scene says the same in words. Placeholders: redraw them!
const SUN = [
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
const HOT_SUN = SUN.map((row) => row.replace(/[ky]/g, "o")); // over 30 °C: the battery drains faster

const MOON = [
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

const STARS = [
  "..........y.........",
  ".........yyy........",
  "..........y.....y...",
  "...............yyy..",
  "..y..............y..",
  ".yyy................",
  "..y.................",
];

const CLOUD = [
  ".....kkkk.....",
  "...kkwwwwk....",
  "..kwwwwwwwkk..",
  ".kwwwwwwwwwwk.",
  "kwwwwwwwwwwwwk",
  "kcccccccccccck",
  ".kkkkkkkkkkkk.",
];

// Raindrops 2 pixels tall, scattered by a fixed rule so the pattern is the same on every visit.
const RAIN = Array.from({ length: 48 }, (_, y) =>
  Array.from({ length: 40 }, (_, x) => ((x * 7 + Math.floor(y / 2) * 11) % 23 === 0 ? "u" : ".")).join(""),
);

export function Sky({ weather: w }: { weather: Weather }) {
  return (
    <>
      {w.raining && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Two copies of the drops, moved down by one copy: the loop has no visible jump. */}
          <div className="motion-safe:animate-[rain_1.5s_linear_infinite]">
            <PixelArt art={RAIN} className="block w-full" />
            <PixelArt art={RAIN} className="block w-full" />
          </div>
        </div>
      )}
      {w.isDay ? (
        <PixelArt art={w.tempC > 30 ? HOT_SUN : SUN} className="absolute left-4 top-4 w-12" />
      ) : (
        <PixelArt art={MOON} className="absolute left-4 top-4 w-10" />
      )}
      {w.raining ? (
        <PixelArt art={CLOUD} className="absolute right-4 top-6 w-20" />
      ) : (
        !w.isDay && <PixelArt art={STARS} className="absolute right-4 top-4 w-24" /> // clouds hide the stars
      )}
    </>
  );
}