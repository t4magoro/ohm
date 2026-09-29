"use client";

import Link from "next/link";
import { useState } from "react";
import { Chat } from "@/components/Chat";
import { Feed } from "@/components/Feed";
import { OhmSprite, type Face } from "@/components/OhmSprite";
import { Sky } from "@/components/Sky";
import { Spellbook } from "@/components/Spellbook";
import { StatBar } from "@/components/StatBar";
import { cleanName, valueNow, type Pet, type Weather } from "@/lib/protocol";
import { useOhm, type Away } from "@/lib/useOhm";
import { askShakePermission, canShake, shakeNeedsPermission, useShake } from "@/lib/useShake";

const HOUR = 3_600_000;
const hours = (ms: number) => `${(ms / HOUR).toFixed(1)} h`;
const button = "rounded border-2 border-current px-4 py-2 font-bold active:translate-y-px disabled:opacity-40";

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

/** What Bandung's weather is doing to Ohm right now, in words. */
function weatherNotes(w: Weather) {
  const notes = [`${Math.round(w.tempC)}°C`];
  if (!w.isDay) notes.push("🌙 night: Ohm sleeps (poke it to wake it up), everything drains at half speed");
  if (w.tempC > 30) notes.push("🥵 hot: the battery drains faster");
  if (w.raining) notes.push("🌧 rain: Ohm's mood drains faster");
  if (notes.length === 1) notes.push("☀️ a calm day");
  return notes.join(" · ");
}

// The scene's background follows the weather. Kept light so Ohm's black outline always shows.
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
  return `👋 While you were away, Ohm ${news.filter(Boolean).join(" and ")}.${said}`;
}

export default function Home() {
  const ohm = useOhm();
  const [draft, setDraft] = useState<string | null>(null); // the name being typed, null when not editing
  const [shakeAllowed, setShakeAllowed] = useState(false); // iPhones only, after tapping "Allow shaking"

  const off = !ohm.pet || isOff(ohm.pet, ohm.now);
  useShake(() => !off && ohm.play(), !shakeNeedsPermission() || shakeAllowed);

  // The build pre-renders this page with no connection, so the first screen is always this one.
  if (!ohm.pet || !ohm.weather || !ohm.brain || !ohm.now) {
    return (
      <main className="grid flex-1 place-items-center p-6 font-mono">
      <p>{ohm.banned ? "⛔ You've been banned from Ohm." : ohm.connected ? "Waking Ohm up…" : "Connecting to Ohm…"}</p>
      </main>
    );
  }

  const { pet, weather, now } = ohm;
  const alive = off ? 0 : now - pet.bornAt;
  const draftOk = draft !== null && cleanName(draft) !== null;
  const pokedAt = ohm.feed.find((e) => e.type === "charge" || e.type === "play")?.at ?? 0;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6 font-mono">
      <header className="flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-bold">Ohm</h1>
        <Link href="/vitals" className="ml-auto text-sm underline">
          📊 Vitals
        </Link>
        <p className="text-sm">{ohm.banned ? "⛔ Banned" : ohm.connected ? `🟢 ${ohm.online} online` : "🔴 Reconnecting…"}</p>
      </header>

      {ohm.away && (
        <p role="status" className="rounded border-2 border-current p-3 text-sm">
          {awayText(ohm.away)}{" "}
          <button type="button" className="underline" onClick={ohm.dismissAway}>
            OK
          </button>
        </p>
      )}

      <section className={`relative grid place-items-center overflow-hidden rounded-lg p-6 ${sceneColor(weather)}`}>
        <Sky weather={weather} />
        <OhmSprite face={faceOf(pet, weather, now, pokedAt)} parts={ohm.unlocked} />
      </section>
      <p className="text-sm">Bandung now: {weatherNotes(weather)}</p>

      <section className="space-y-3">
        <StatBar label="Charge" stat={pet.charge} now={now} />
        <StatBar label="Mood" stat={pet.mood} now={now} />
        <p className="text-sm">
          {off
            ? `Ohm is off. Life #${pet.life} ${pet.offAt ? `lasted ${hours(pet.offAt - pet.bornAt)}` : "just ended"}`
            : `Life #${pet.life}: alive for ${hours(alive)}`}
          {` · Record: ${hours(Math.max(pet.recordMs, alive))}`}
        </p>
      </section>

      <section className="flex gap-3">
        {off ? (
          <button type="button" className={button} onClick={ohm.reboot}>
            🔁 Reboot Ohm
          </button>
        ) : (
          <>
            <button type="button" className={button} onClick={ohm.charge}>
              ⚡ Charge
            </button>
            <button type="button" className={button} onClick={ohm.play}>
              🎈 Play
            </button>
          </>
        )}
      </section>
      {ohm.toast && (
        <p role="status" className={`text-sm ${ohm.toast.bad ? "text-red-600" : "text-green-600"}`}>
          {ohm.toast.text}
        </p>
      )}
      {canShake() && (
        <p className="text-sm">
          📳 Shake your phone to play with Ohm.{" "}
          {shakeNeedsPermission() && !shakeAllowed && (
            <button
              type="button"
              className="underline"
              onClick={async () => setShakeAllowed(await askShakePermission())}
            >
              Allow shaking
            </button>
          )}
        </p>
      )}

      <form
        className="space-y-1 text-sm"
        onSubmit={(e) => {
          e.preventDefault();
          const clean = cleanName(draft ?? "");
          if (!clean) return;
          ohm.rename(clean);
          setDraft(null);
        }}
      >
        <label htmlFor="name" className="block">
          Your name
        </label>
        <div className="flex gap-2">
          <input
            id="name"
            value={draft ?? ohm.name}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={16}
            className="min-w-0 flex-1 rounded border-2 border-current bg-transparent px-2 py-1"
          />
          <button type="submit" className={button} disabled={!draftOk}>
            Save
          </button>
        </div>
        {draft !== null && !draftOk && <p className="text-red-600">2–16 letters, numbers, spaces, - or _</p>}
      </form>

      <Chat items={ohm.chat} disabled={off} onSay={ohm.say} onReport={ohm.report} />
      <Spellbook brain={ohm.brain} />

      <section>
        <h2 className="mb-2 font-bold">Live feed</h2>
        <Feed events={ohm.feed} />
      </section>

      <footer className="mt-auto space-y-1 text-xs opacity-70">
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
    </main>
  );
}