"use client";

import Link from "next/link";
import { useState } from "react";
import { Backdrop, Skyline, type SkyName } from "@/components/Backdrop";
import { Chat } from "@/components/Chat";
import { Device } from "@/components/Device";
import { Feed } from "@/components/Feed";
import { OhmSprite, type Face } from "@/components/OhmSprite";
import { PixelArt } from "@/components/pixel/PixelArt";
import { Sky } from "@/components/Sky";
import { Spellbook } from "@/components/Spellbook";
import { StatBar } from "@/components/StatBar";
import { cleanName, valueNow, type Pet, type Weather } from "@/lib/protocol";
import { useOhm, type Away } from "@/lib/useOhm";
import { askShakePermission, canShake, shakeNeedsPermission, useShake } from "@/lib/useShake";

const HOUR = 3_600_000;
const hours = (ms: number) => `${(ms / HOUR).toFixed(1)}h`;

// Ohm counts as off the moment its charge hits 0, even before the server hears about it.
const isOff = (pet: Pet, now: number) => pet.status === "off" || valueNow(pet.charge, now) === 0;

const WAKE_MS = 5_000; // at night, a charge or play wakes Ohm up for this long

function faceOf(pet: Pet, weather: Weather, now: number, pokedAt: number): Face {
  if (isOff(pet, now)) return "off";
  if (!weather.isDay && now - pokedAt > WAKE_MS) return "sleep";
  const mood = valueNow(pet.mood, now);
  if (mood >= 60 && valueNow(pet.charge, now) >= 20) return "happy";
  return mood >= 25 ? "okay" : "sad";
}

/** What Bandung's weather is doing to Ohm right now, as RPG status effects: [text, color]. */
function effects(w: Weather): [string, string][] {
  const list: [string, string][] = [[`${Math.round(w.tempC)}°C in Bandung`, ""]];
  if (!w.isDay) list.push(["night: Ohm sleeps, poke it to wake it up", "text-lilac"], ["everything drains at half speed", "text-mint"]);
  if (w.tempC > 30) list.push(["hot: the battery drains faster", "text-danger"]);
  if (w.raining) list.push(["rain: Ohm's mood drains faster", "text-danger"]);
  if (list.length === 1) list.push(["a calm day", "text-mint"]);
  return list;
}

// The whole page follows Bandung's sky (see data-sky in globals.css). Ohm's screen follows it too,
// in lighter colors so Ohm's black outline always shows.
const skyOf = (w: Weather): SkyName => (!w.isDay ? "night" : w.raining ? "rain" : "day");
const sceneColor = (w: Weather) =>
  !w.isDay ? "bg-[#cdd5f3]" : w.raining ? "bg-[#dfe7ef]" : w.tempC > 30 ? "bg-[#ffe2c4]" : "bg-[#fff8e7]";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** "While you were away, Ohm learned 14 new words and shut down 1 time. …" */
function awayText(a: Away) {
  const news = [
    a.learned > 0 && `learned ${plural(a.learned, "new word")}`,
    a.shutdowns > 0 && `shut down ${plural(a.shutdowns, "time")}`,
  ];
  const said = a.said > 0 ? ` It has used the words you taught ${plural(a.said, "time")} so far.` : "";
  return `While you were away, Ohm ${news.filter(Boolean).join(" and ")}.${said}`;
}

// The tail under Ohm's speech bubble, 3 screen pixels per pixel to match the bubble's border.
const TAIL = ["kwwwwk", ".kwwk.", "..kk.."];

export default function Home() {
  const ohm = useOhm();
  const [draft, setDraft] = useState<string | null>(null); // the name being typed, null when not editing
  const [shakeAllowed, setShakeAllowed] = useState(false); // iPhones only, after tapping "Allow shaking"

  const off = !ohm.pet || isOff(ohm.pet, ohm.now);
  useShake(() => !off && ohm.play(), !shakeNeedsPermission() || shakeAllowed);

  // The build pre-renders this page with no connection, so the first screen is always this one.
  if (!ohm.pet || !ohm.weather || !ohm.brain || !ohm.now) {
    return (
      <main className="grid flex-1 place-items-center p-6 text-2xl">
        <p className={ohm.banned ? "text-danger" : ""}>
          <span className="text-mint">ohm&gt;</span>{" "}
          {ohm.banned ? "You've been banned from Ohm." : ohm.connected ? "waking Ohm up..." : "connecting to Ohm..."}
          <span className="motion-safe:animate-blink">_</span>
        </p>
      </main>
    );
  }

  const { pet, weather, brain, now } = ohm;
  const sky = skyOf(weather);
  const alive = off ? 0 : now - pet.bornAt;
  const draftOk = draft !== null && cleanName(draft) !== null;
  const poke = ohm.feed.find((e) => e.type === "charge" || e.type === "play");
  const face = faceOf(pet, weather, now, poke?.at ?? 0);
  const said = ohm.chat.findLast((item) => item.from === "ohm");
  const talking = !off && face !== "sleep" && said; // showing a real line, not "zzz..."
  const bubble = off ? "..." : face === "sleep" ? "zzz..." : (said?.text ?? "beep boop?");

  const stats: [string, string][] = [
    ["life", `#${pet.life}`],
    off ? ["lasted", pet.offAt ? hours(pet.offAt - pet.bornAt) : "-"] : ["alive", hours(alive)],
    ["record", hours(Math.max(pet.recordMs, alive))],
    ["charged", `${pet.charges}x`],
  ];

  return (
    <main data-sky={sky} className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-5 text-foreground">
      <Backdrop sky={sky} />

      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="title-outline font-pixel text-5xl font-bold leading-none">OHM</h1>
          <p className="mt-1 text-foreground/80">the internet&apos;s robot pet</p>
        </div>
        <Link href="/vitals" className="btn">
          vitals
        </Link>
      </header>

      {ohm.away && (
        <div className="term flex items-start gap-2 px-3 py-2">
          <p className="flex-1">
            <span className="text-mint">ohm&gt;</span> {awayText(ohm.away)}
          </p>
          <button type="button" className="term-btn" onClick={ohm.dismissAway}>
            [ok]
          </button>
        </div>
      )}

      <section aria-label="Ohm" className="space-y-4">
        {/* A new line pops out of the tail, so it grows from where Ohm is. */}
        <div
          key={talking ? talking.key : bubble}
          className="relative mx-auto w-fit max-w-[85%] origin-[1.75rem_100%] border-[3px] border-ink bg-white px-3 py-1 text-xl leading-tight text-ink motion-safe:animate-pop motion-reduce:animate-fade"
        >
          {bubble}
          {talking && <span className="text-base text-[#5b6180]"> @{talking.to}</span>}
          <PixelArt art={TAIL} className="absolute left-4 top-full w-[18px]" />
        </div>

        <Device
          screen={
            <div className={`relative flex size-full items-end justify-center ${sceneColor(weather)}`}>
              <Sky weather={weather} />
              {/* Remounts on every charge or play, so Ohm hops when someone pokes it. */}
              <div key={poke?.id} className="relative h-[92%] motion-safe:animate-hop">
                <OhmSprite face={face} parts={ohm.unlocked} className="h-full w-auto" />
              </div>
            </div>
          }
          buttons={[
            { label: "charge", onClick: ohm.charge, disabled: off },
            { label: "play", onClick: ohm.play, disabled: off },
            { label: "reboot", onClick: ohm.reboot, disabled: !off },
          ]}
        />

        {canShake() && (
          <p className="text-center text-foreground/80">
            Shake your phone to play with Ohm.{" "}
            {shakeNeedsPermission() && !shakeAllowed && (
              <button type="button" className="underline" onClick={async () => setShakeAllowed(await askShakePermission())}>
                Allow shaking
              </button>
            )}
          </p>
        )}
      </section>

      <section className="card space-y-3 p-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-pixel text-sm font-bold">
            Ohm <span className="text-lemon">{`{LV${brain.level}}`}</span>{" "}
            <span className={off ? "text-danger" : "text-pink"}>{off ? "{POWERED OFF}" : "{ROBOT PET}"}</span>
          </h2>
          <p className="flex shrink-0 items-center gap-1.5">
            <span className={`size-2 ${ohm.connected && !ohm.banned ? "bg-mint" : "bg-danger"}`} />
            {ohm.banned ? "banned" : ohm.connected ? `${ohm.online} online` : "reconnecting..."}
          </p>
        </div>
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
        <ul className="grid gap-x-4 leading-tight sm:grid-cols-2">
          {off && <li className="text-danger">*powered off: press reboot</li>}
          {effects(weather).map(([text, color]) => (
            <li key={text} className={color}>
              *{text}
            </li>
          ))}
        </ul>
      </section>

      <form
        className="term px-3 py-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          const clean = cleanName(draft ?? "");
          if (!clean) return;
          ohm.rename(clean);
          setDraft(null);
        }}
      >
        <div className="flex items-center gap-2">
          <label htmlFor="name" className="text-dim">
            your name:
          </label>
          <input
            id="name"
            value={draft ?? ohm.name}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={16}
            autoComplete="nickname"
            className="term-input"
          />
          <button type="submit" className="term-btn" disabled={!draftOk}>
            [save]
          </button>
        </div>
        {draft !== null && !draftOk && <p className="text-danger">! 2-16 letters, numbers, spaces, - or _</p>}
      </form>

      <Chat items={ohm.chat} disabled={off} onSay={ohm.say} onReport={ohm.report} />
      <Spellbook brain={brain} />
      <Feed events={ohm.feed} />

      <footer className="mt-auto space-y-1 text-base text-foreground/80">
        <p>
          Privacy: no accounts. Your browser keeps a random visitor ID and your name. Ohm stores your IP address only
          as a salted hash, to block spam. The words you teach appear in the feed with your name.
        </p>
        <p>
          Weather data by{" "}
          <a href="https://open-meteo.com/" className="underline">
            Open-Meteo.com
          </a>
        </p>
        <p>
          Word lists:{" "}
          <a href="https://github.com/hermitdave/FrequencyWords" className="underline">
            FrequencyWords
          </a>{" "}
          (MIT) and{" "}
          <a href="https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words" className="underline">
            LDNOOBW
          </a>{" "}
          (CC BY 4.0)
        </p>
      </footer>

      {/* Ohm lives in Bandung: Gedung Sate stands at the bottom of the page, flush with its edge. */}
      <div className="-mb-5">
        <Skyline lit={sky === "night"} />
      </div>

      {/* Messages from Ohm float at the bottom, so you see them wherever you've scrolled to. */}
      <div role="status" className="pointer-events-none fixed inset-x-0 bottom-4 z-10 flex justify-center px-4">
        {ohm.toast && (
          <p
            key={ohm.toast.text}
            className={`term px-3 py-1 motion-safe:animate-rise motion-reduce:animate-fade ${ohm.toast.bad ? "text-danger" : "text-mint"}`}
          >
            &gt; {ohm.toast.text}
          </p>
        )}
      </div>
    </main>
  );
}
