import { Fragment } from "react";
import { litOf, wordsOf } from "@/content/thinking";
import type { ChatItem, Poke } from "@/hooks/useOhm";
import { faceOf, skyOf } from "@/lib/ohmState";
import type { MilestoneId, Pet as PetState, Weather } from "@/lib/protocol";
import { skyLook } from "@/lib/skyLook";
import { Device, type DeviceButton } from "../pixel/Device";
import { OhmSprite } from "../pixel/OhmSprite";
import { PixelArt } from "../pixel/PixelArt";
import { Sky } from "../pixel/Sky";
import { BUBBLE_TAIL } from "../pixel/sprites/device";
import { HEART } from "../pixel/sprites/icons";
import { StatusBar } from "../pixel/StatusBar";
import { ThinkScreen } from "../pixel/ThinkScreen";

const REACTION_MS = 2_000; // a poke younger than this still shows its "ZAP!" (or a pat's heart)

type Props = {
  pet: PetState;
  weather: Weather;
  now: number;
  poke: Poke | null;
  chat: ChatItem[];
  unlocked: MilestoneId[];
  buttons: DeviceButton[];
  /** While Ohm replays how he built a line (useThinking.ts): the line, and the page he's on. */
  thinking?: { line: ChatItem; page: number };
};

/** Ohm in its toy, with its speech bubble. Sized by its parent (a size container, see page.tsx). */
export function Pet({ pet, weather, now, poke, chat, unlocked, buttons, thinking }: Props) {
  const face = faceOf(pet, weather, now, poke?.at ?? 0);
  const off = face === "off";
  const said = chat.findLast((item) => item.from === "ohm");
  const talking = !off && face !== "sleep" && said; // showing a real line, not "zzz..."
  const bubble = off ? "..." : face === "sleep" ? "zzz..." : (said?.text ?? "beep boop?");
  const fresh = poke && now - poke.at < REACTION_MS ? poke : null;
  // While Ohm thinks, the bubble shows the words he thought, with the one on his screen marked.
  const thought = thinking?.line.why && { line: thinking.line, words: wordsOf(thinking.line.why), lit: litOf(thinking.line.why, thinking.page) };
  const by = thought ? thought.line : talking;

  return (
    <div className="relative w-[min(100cqw,92cqh)]">
      <Device
        buttons={buttons}
        screen={
          thinking ? (
            <ThinkScreen why={thinking.line.why} page={thinking.page} />
          ) : (
            // The screen follows Bandung's sky too, in light colors so Ohm's black outline always shows.
            <div className="flex size-full flex-col transition-colors duration-1000" style={{ backgroundColor: skyLook(weather, now).screen }}>
              <StatusBar sky={skyOf(weather, now)} now={now} />
              <div className="relative flex min-h-0 flex-1 items-end justify-center overflow-hidden">
                <Sky weather={weather} now={now} />
                {/* Remounts on every charge or play, so Ohm hops when someone pokes it. */}
                <div key={poke?.key} className="relative h-[92%] motion-safe:animate-hop">
                  <OhmSprite face={face} parts={unlocked} className="h-full w-auto" />
                </div>
                {fresh?.type === "pat" ? (
                  <PixelArt key={`love-${fresh.key}`} art={HEART} className="absolute top-[10%] hidden w-[9%] motion-safe:block motion-safe:animate-float" />
                ) : (
                  fresh && (
                    <p
                      key={`zap-${fresh.key}`} // not just the key: the hop above already uses it
                      aria-hidden
                      className={`title-outline absolute top-[6%] hidden font-pixel text-lg font-bold motion-safe:block motion-safe:animate-float ${fresh.type === "charge" ? "[--drop:var(--color-lemon)]" : ""}`}
                    >
                      {fresh.type === "charge" ? "ZAP!" : "YAY!"}
                    </p>
                  )
                )}
              </div>
            </div>
          )
        }
      />

      {/* Ohm's latest line sits on the toy like a sticker. A new one pops out of the tail, where Ohm is. */}
      <div
        key={by ? by.key : bubble}
        className="absolute left-[3%] top-[1%] max-w-[72%] origin-[1.75rem_100%] border-[3px] border-ink bg-white px-2.5 py-0.5 text-lg leading-tight text-ink motion-safe:animate-pop motion-reduce:animate-fade"
      >
        {thought
          ? thought.words.map((w, i) => (
              <Fragment key={i}>
                {i > 0 && " "}
                <span className={i === thought.lit ? "bg-ink text-white" : undefined}>{w}</span>
              </Fragment>
            ))
          : bubble}
        {by && <span className="text-base text-[#5b6180]"> to @{by.to}</span>}
        <PixelArt art={BUBBLE_TAIL} className="absolute left-4 top-full w-[18px]" />
      </div>
    </div>
  );
}