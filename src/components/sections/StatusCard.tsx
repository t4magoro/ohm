import { WEATHER_TEXT } from "@/content/weather";
import { hours } from "@/lib/format";
import { statusEffects } from "@/lib/ohmState";
import type { Brain, Pet, Weather } from "@/lib/protocol";
import { StatBar } from "../ui/StatBar";

type Props = { pet: Pet; weather: Weather; brain: Brain; now: number; off: boolean };

/** Ohm's stats, like a character card in an RPG: name line, bars, numbers and status effects. */
export function StatusCard({ pet, weather, brain, now, off }: Props) {
  const alive = off ? 0 : now - pet.bornAt;
  const stats: [string, string][] = [
    ["life", `#${pet.life}`],
    off ? ["lasted", pet.offAt ? hours(pet.offAt - pet.bornAt) : "-"] : ["alive", hours(alive)],
    ["record", hours(Math.max(pet.recordMs, alive))],
    ["charged", `${pet.charges}x`],
  ];

  return (
    <section className="card space-y-3 p-3">
      <h2 className="font-pixel text-sm font-bold">
        Ohm <span className="text-lemon">{`{LV${brain.level}}`}</span>{" "}
        <span className={off ? "text-danger" : "text-pink"}>{off ? "{POWERED OFF}" : "{ROBOT PET}"}</span>
      </h2>
      <StatBar label="charge" stat={pet.charge} now={now} color="bg-lemon" />
      <StatBar label="mood" stat={pet.mood} now={now} color="bg-pink" />
      <dl className="grid grid-cols-4 gap-1.5 text-center">
        {stats.map(([label, value]) => (
          <div key={label} className="bg-screen py-1.5">
            <dt className="font-pixel text-[9px] text-dim">{label}</dt>
            <dd className="text-2xl leading-none text-lemon">{value}</dd>
          </div>
        ))}
      </dl>
      <ul className="leading-tight">
        {off && <li className={WEATHER_TEXT.off[1]}>*{WEATHER_TEXT.off[0]}</li>}
        {statusEffects(weather).map(([text, color]) => (
          <li key={text} className={color}>
            *{text}
          </li>
        ))}
      </ul>
    </section>
  );
}
