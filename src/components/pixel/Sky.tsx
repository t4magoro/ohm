import type { Weather } from "@/lib/protocol";
import { PixelArt } from "./PixelArt";
import { CLOUD, HOT_SUN, MOON, RAIN, STARS, SUN } from "./sprites/sky";

/** Bandung's sky behind Ohm, on its screen. Decoration only: the status card says the same in words. */
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
        <PixelArt art={w.tempC > 30 ? HOT_SUN : SUN} className="absolute left-[4%] top-[5%] w-[17%]" />
      ) : (
        <PixelArt art={MOON} className="absolute left-[4%] top-[5%] w-[14%]" />
      )}
      {w.raining ? (
        <PixelArt art={CLOUD} className="absolute right-[4%] top-[8%] w-[27%]" />
      ) : (
        !w.isDay && <PixelArt art={STARS} className="absolute right-[4%] top-[5%] w-[30%]" /> // clouds hide the stars
      )}
    </>
  );
}
