import { valueNow, type FeedEvent, type MilestoneId, type Pet as PetState, type Weather } from "@/lib/protocol";
import type { ChatItem } from "@/lib/useOhm";
import { Device, type DeviceButton } from "./Device";
import { OhmSprite, type Face } from "./OhmSprite";
import { PixelArt } from "./pixel/PixelArt";
import { Sky } from "./Sky";

// Ohm counts as off the moment its charge hits 0, even before the server hears about it.
export const isOff = (pet: PetState, now: number) => pet.status === "off" || valueNow(pet.charge, now) === 0;

const WAKE_MS = 5_000; // at night, a charge or play wakes Ohm up for this long
const REACTION_MS = 2_000; // a poke younger than this still shows its "ZAP!"

function faceOf(pet: PetState, weather: Weather, now: number, pokedAt: number): Face {
  if (isOff(pet, now)) return "off";
  if (!weather.isDay && now - pokedAt > WAKE_MS) return "sleep";
  const mood = valueNow(pet.mood, now);
  if (mood >= 60 && valueNow(pet.charge, now) >= 20) return "happy";
  return mood >= 25 ? "okay" : "sad";
}

// The screen follows Bandung's weather too, in light colors so Ohm's black outline always shows.
const sceneColor = (w: Weather) =>
  !w.isDay ? "bg-[#cdd5f3]" : w.raining ? "bg-[#dfe7ef]" : w.tempC > 30 ? "bg-[#ffe2c4]" : "bg-[#fff8e7]";

// The tail under the speech bubble, 3 screen pixels per pixel to match the bubble's border.
const TAIL = ["kwwwwk", ".kwwk.", "..kk.."];

type Props = {
  pet: PetState;
  weather: Weather;
  now: number;
  feed: FeedEvent[];
  chat: ChatItem[];
  unlocked: MilestoneId[];
  buttons: DeviceButton[];
};

/** Ohm in its toy, with its speech bubble. Sized by its parent (a size container, see page.tsx). */
export function Pet({ pet, weather, now, feed, chat, unlocked, buttons }: Props) {
  const poke = feed.find((e) => e.type === "charge" || e.type === "play");
  const face = faceOf(pet, weather, now, poke?.at ?? 0);
  const off = face === "off";
  const said = chat.findLast((item) => item.from === "ohm");
  const talking = !off && face !== "sleep" && said; // showing a real line, not "zzz..."
  const bubble = off ? "..." : face === "sleep" ? "zzz..." : (said?.text ?? "beep boop?");
  const fresh = poke && now - poke.at < REACTION_MS ? poke : null;

  return (
    <div className="relative w-[min(100cqw,92cqh)]">
      <Device
        buttons={buttons}
        screen={
          <div className={`relative flex size-full items-end justify-center ${sceneColor(weather)}`}>
            <Sky weather={weather} />
            {/* Remounts on every charge or play, so Ohm hops when someone pokes it. */}
            <div key={poke?.id} className="relative h-[92%] motion-safe:animate-hop">
              <OhmSprite face={face} parts={unlocked} className="h-full w-auto" />
            </div>
            {fresh && (
              <p
                key={`zap-${fresh.id}`} // not just the id: the hop above already uses it as a key
                aria-hidden
                className={`title-outline absolute top-[6%] hidden font-pixel text-lg font-bold motion-safe:block motion-safe:animate-float ${fresh.type === "charge" ? "[--drop:var(--color-lemon)]" : ""}`}
              >
                {fresh.type === "charge" ? "ZAP!" : "YAY!"}
              </p>
            )}
          </div>
        }
      />

      {/* Ohm's latest line sits on the toy like a sticker. A new one pops out of the tail, where Ohm is. */}
      <div
        key={talking ? talking.key : bubble}
        className="absolute left-[3%] top-[1%] max-w-[72%] origin-[1.75rem_100%] border-[3px] border-ink bg-white px-2.5 py-0.5 text-lg leading-tight text-ink motion-safe:animate-pop motion-reduce:animate-fade"
      >
        {bubble}
        {talking && <span className="text-base text-[#5b6180]"> @{talking.to}</span>}
        <PixelArt art={TAIL} className="absolute left-4 top-full w-[18px]" />
      </div>
    </div>
  );
}
