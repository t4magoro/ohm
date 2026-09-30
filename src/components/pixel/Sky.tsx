import { bandungHour } from "@/lib/ohmState";
import type { Weather } from "@/lib/protocol";
import { PixelArt } from "./PixelArt";
import { CLOUD, HOT_SUN, MOON, RAIN, STARS, SUN } from "./sprites/sky";

// Where the sun (or moon) is on its arc: it rises at the left edge and sets at the right. Around noon it
// climbs behind the status bar, so it peeks in overhead instead of sitting on Ohm's antenna.
// Day 05:35–17:45, night 17:45–05:35: Bandung's sunrise and sunset barely move through the year.
function arc(now: number, isDay: boolean) {
  const h = bandungHour(now);
  const t = isDay ? (h - 5.6) / 12.15 : ((h - 17.75 + 24) % 24) / 11.85;
  const c = Math.min(1, Math.max(0, t));
  return { left: `${3 + c * 80}%`, top: `${58 - Math.sin(c * Math.PI) * 76}%` };
}

/** Bandung's sky behind Ohm, on its screen. Decoration only: the status card says the same in words. */
export function Sky({ weather: w, now }: { weather: Weather; now: number }) {
  const at = arc(now, w.isDay);
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
        <PixelArt art={w.tempC > 30 ? HOT_SUN : SUN} className="absolute w-[17%]" style={at} />
      ) : (
        <PixelArt art={MOON} className="absolute w-[14%]" style={at} />
      )}
      {w.raining ? (
        <PixelArt art={CLOUD} className="absolute right-[4%] top-[8%] w-[27%]" />
      ) : (
        !w.isDay && <PixelArt art={STARS} className="absolute right-[4%] top-[5%] w-[30%]" /> // clouds hide the stars
      )}
    </>
  );
}