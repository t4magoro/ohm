import type { SkyName } from "@/lib/ohmState";
import type { SkyLook } from "@/lib/skyLook";
import { COLS, LANDSCAPE, ROWS } from "./landscape";
import { PixelArt } from "./PixelArt";
import { BIRD_DOWN, BIRD_UP, CLOUD, SHOOTING_STAR, SPARKLE } from "./sprites/scene";

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
// How tall each color band of the sky is, top to bottom: hard edges, like a pixel-art sunset.
const BAND_SIZES = [22, 20, 20, 38];

/**
 * Behind the whole page: the sky's color bands (see lib/skyLook.ts), drifting clouds and a bird by day,
 * twinkling stars and a shooting star at night, and Bandung's mountains along the ground.
 * Decoration only; everything stands still with reduced motion.
 * On phones the ground sits just above the bottom console (--console-top, set on <main>).
 */
export function Backdrop({ sky, look }: { sky?: SkyName; look?: SkyLook }) {
  const night = sky === "night";
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {look && (
        <div className="absolute inset-0 flex flex-col">
          {look.bands.map((color, i) => (
            <div key={i} className="transition-colors duration-1000" style={{ backgroundColor: color, flexGrow: BAND_SIZES[i] }} />
          ))}
        </div>
      )}
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
            {/* Clouds catch the low sun's color; rain clouds are grey. */}
            <PixelArt art={CLOUD} className={size} style={{ filter: look?.cloud }} />
          </div>
        ))}

      {(sky === "day" || sky === "sunrise") && (
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

      {/* The same landscape in every light: tinted warm at sunrise and sunset, darker at night. */}
      <svg
        viewBox={`0 0 ${COLS} ${ROWS}`}
        preserveAspectRatio="xMidYMax slice"
        shapeRendering="crispEdges"
        className="absolute inset-x-0 bottom-[var(--console-top,0px)] h-[24dvh] w-full transition-[filter] duration-1000 lg:bottom-0 lg:h-[38vh]"
        style={{ filter: look?.land ?? "saturate(0.5) brightness(0.35)" }}
      >
        {LANDSCAPE.map(([d, color]) => (
          <path key={color} d={d} fill={color} />
        ))}
      </svg>
    </div>
  );
}