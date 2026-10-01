// The Vitals page's words: the situations Ohm links words to, and the learning cards' empty states.
import type { Situation } from "@/lib/protocol";

/** How each situation reads in "What Ohm understands". */
export const SITUATION_LABEL: Record<Situation, string> = {
  rain: "rain",
  hot: "hot days",
  pagi: "mornings",
  siang: "midday",
  sore: "afternoons",
  malam: "night",
  battery_low: "low battery",
  mood_low: "low mood",
  charge: "charging",
  play: "playing",
  reboot: "rebooting",
};

export const NO_SKILLS = "No skill readings yet: Ohm writes them down every hour.";
export const NO_LINKS =
  "Nothing yet. When different people keep using a word in the same situation (rain, night, charging…), it shows up here.";
export const LIFT_NOTE = "× usual: how much more likely the situation is when someone uses that word. Ohm only knows what people tell him, so these are as accurate as the chat.";