"use client";

import { useState } from "react";
import { Feed } from "@/components/Feed";
import { OhmSprite, type Face } from "@/components/OhmSprite";
import { StatBar } from "@/components/StatBar";
import { cleanName, valueNow, type Pet, type Weather } from "@/lib/protocol";
import { useOhm } from "@/lib/useOhm";
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
  if (!w.isDay) notes.push("🌙 night: Ohm sleeps, everything drains at half speed");
  if (w.tempC > 30) notes.push("🥵 hot: the battery drains faster");
  if (w.raining) notes.push("🌧 rain: Ohm's mood drains faster");
  if (notes.length === 1) notes.push("☀️ a calm day");
  if (!w.isDay) notes.push("🌙 night: Ohm sleeps (poke it to wake it up), everything drains at half speed");
  return notes.join(" · ");
}

// The scene's background follows the weather. Kept light so Ohm's black outline always shows.
const sceneColor = (w: Weather) =>
  !w.isDay ? "bg-[#cdd5f3]" : w.raining ? "bg-[#dfe7ef]" : w.tempC > 30 ? "bg-[#ffe2c4]" : "bg-[#fff8e7]";

export default function Home() {
  const ohm = useOhm();
  const [draft, setDraft] = useState<string | null>(null); // the name being typed, null when not editing
  const [shakeAllowed, setShakeAllowed] = useState(false); // iPhones only, after tapping "Allow shaking"

  const off = !ohm.pet || isOff(ohm.pet, ohm.now);
  useShake(() => !off && ohm.play(), !shakeNeedsPermission() || shakeAllowed);

  // The build pre-renders this page with no connection, so the first screen is always this one.
  if (!ohm.pet || !ohm.weather || !ohm.now) {
    return (
      <main className="grid flex-1 place-items-center p-6 font-mono">
        <p>{ohm.connected ? "Waking Ohm up…" : "Connecting to Ohm…"}</p>
      </main>
    );
  }

  const { pet, weather, now } = ohm;
  const alive = off ? 0 : now - pet.bornAt;
  const draftOk = draft !== null && cleanName(draft) !== null;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6 font-mono">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">Ohm</h1>
        <p className="text-sm">{ohm.connected ? `🟢 ${ohm.online} online` : "🔴 Reconnecting…"}</p>
      </header>

      <section className={`grid place-items-center rounded-lg p-6 ${sceneColor(weather)}`}>
        <OhmSprite face={faceOf(pet, weather, now, ohm.feed.find((e) => e.type === "charge" || e.type === "play")?.at ?? 0)} />
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
      {ohm.error && (
        <p role="alert" className="text-sm text-red-600">
          {ohm.error}
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
          Your name in the feed
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

      <section>
        <h2 className="mb-2 font-bold">Live feed</h2>
        <Feed events={ohm.feed} />
      </section>

      <footer className="mt-auto text-xs opacity-70">
        Weather data by{" "}
        <a href="https://open-meteo.com/" className="underline">
          Open-Meteo.com
        </a>
      </footer>
    </main>
  );
}