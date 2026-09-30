import { bandungClock } from "@/lib/format";
import type { SkyName } from "@/lib/ohmState";

/** The strip across the top of Ohm's screen: the scene and Bandung's time, like a handheld's LCD. */
export function StatusBar({ sky, now }: { sky: SkyName; now: number }) {
  const [hh, mm] = bandungClock(now).split(":");
  return (
    <p className="flex 
                  items-center 
                  justify-between 
                  bg-ink/85 
                  px-[5%] 
                  py-[2%] 
                  font-pixel 
                  text-[clamp(10px,4cqw,13px)] 
                  leading-none 
                  tracking-wide 
                  text-[#fff8e7]">
      <span className="uppercase opacity-70">{sky}</span>
      <time className="tabular-nums">
        {hh}
        <span className="motion-safe:animate-blink">:</span>
        {mm}
      </time>
    </p>
  );
}