"use client";

import { useState } from "react";
import { Feed } from "@/components/Feed";
import { OhmSprite, type Face } from "@/components/OhmSprite";
import { StatBar } from "@/components/StatBar";
import { cleanName, valueNow, type Pet } from "@/lib/protocol";
import { useOhm } from "@/lib/useOhm";

const HOUR = 3_600_000;
const hours = (ms: number) => `${(ms / HOUR).toFixed(1)} h`;
const button = "rounded border-2 border-current px-4 py-2 font-bold active:translate-y-px disabled:opacity-40";

// Ohm counts as off the moment its charge hits 0, even before the server hears about it.
const isOff = (pet: Pet, now: number) => pet.status === "off" || valueNow(pet.charge, now) === 0;

function faceOf(pet: Pet, now: number): Face {
  if (isOff(pet, now)) return "off";
  const mood = valueNow(pet.mood, now);
  if (mood >= 60 && valueNow(pet.charge, now) >= 20) return "happy";
  return mood >= 25 ? "okay" : "sad";
}

export default function Home() {
  const ohm = useOhm();
  const [draft, setDraft] = useState<string | null>(null); // the name being typed, null when not editing

  // The build pre-renders this page with no connection, so the first screen is always this one.
  if (!ohm.pet || !ohm.now) {
    return (
      <main className="grid flex-1 place-items-center p-6 font-mono">
        <p>{ohm.connected ? "Waking Ohm up…" : "Connecting to Ohm…"}</p>
      </main>
    );
  }

  const { pet, now } = ohm;
  const off = isOff(pet, now);
  const alive = off ? 0 : now - pet.bornAt;
  const draftOk = draft !== null && cleanName(draft) !== null;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6 font-mono">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">Ohm</h1>
        <p className="text-sm">{ohm.connected ? `🟢 ${ohm.online} online` : "🔴 Reconnecting…"}</p>
      </header>

      {/* Light background so Ohm's black outline shows in dark mode too. */}
      <section className="grid place-items-center rounded-lg bg-[#fff8e7] p-6">
        <OhmSprite face={faceOf(pet, now)} />
      </section>

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
    </main>
  );
}