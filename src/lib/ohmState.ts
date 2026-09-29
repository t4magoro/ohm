// The rules for how Ohm and the sky look right now, worked out from the live data.
import { WEATHER_TEXT } from "@/content/weather";
import { valueNow, type Pet, type Weather } from "./protocol";

export type Face = "happy" | "okay" | "sad" | "sleep" | "off";
export type SkyName = "day" | "rain" | "night";

const WAKE_MS = 5_000; // at night, a charge or play wakes Ohm up for this long

/** Ohm counts as off the moment its charge hits 0, even before the server hears about it. */
export const isOff = (pet: Pet, now: number) => pet.status === "off" || valueNow(pet.charge, now) === 0;

/** Which face Ohm shows. `pokedAt` is when someone last charged or played. */
export function faceOf(pet: Pet, weather: Weather, now: number, pokedAt: number): Face {
  if (isOff(pet, now)) return "off";
  if (!weather.isDay && now - pokedAt > WAKE_MS) return "sleep";
  const mood = valueNow(pet.mood, now);
  if (mood >= 60 && valueNow(pet.charge, now) >= 20) return "happy";
  return mood >= 25 ? "okay" : "sad";
}

/** The whole page follows Bandung's sky (see data-sky in styles/theme.css). */
export const skyOf = (w: Weather): SkyName => (!w.isDay ? "night" : w.raining ? "rain" : "day");

/** What Bandung's weather is doing to Ohm right now, as RPG status effects: [text, color]. */
export function statusEffects(w: Weather): (readonly [string, string])[] {
  const list: (readonly [string, string])[] = [[WEATHER_TEXT.temp(w.tempC), ""]];
  if (!w.isDay) list.push(...WEATHER_TEXT.night);
  if (w.tempC > 30) list.push(WEATHER_TEXT.hot);
  if (w.raining) list.push(WEATHER_TEXT.rain);
  if (list.length === 1) list.push(WEATHER_TEXT.calm);
  return list;
}
