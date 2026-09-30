// Small icons for the situations Ohm links words to ("What Ohm understands" on the Vitals page), 7 × 6 each.
// Each letter is a color from ../palette.ts, "." is transparent. Placeholders: redraw them!
import type { Situation } from "@/lib/protocol";
import { FROWN, HEART } from "./icons";

export const SITUATION_ICONS: Record<Situation, string[]> = {
  rain: [".www...", "wwwwww.", "wwwwwww", ".......", ".u.u.u.", "u.u.u.."],
  hot: ["o..o..o", ".ooooo.", "ooyyyoo", ".ooooo.", "o..o..o", "......."],
  pagi: [".......", "..yyy..", ".yyyyy.", "yyyyyyy", "ppppppp", "......."],
  siang: ["y..y..y", ".yyyyy.", "yyyyyyy", ".yyyyy.", "y..y..y", "......."],
  sore: [".......", ".......", "..ooo..", ".ooooo.", "mmmmmmm", "......."],
  malam: ["..www..", ".ww....", "ww.....", "ww.....", ".ww....", "..www.."],
  battery_low: ["wwwwww.", "wp...ww", "wp...ww", "wwwwww.", ".......", "......."],
  mood_low: FROWN,
  charge: ["...yy..", "..yy...", ".yyyyy.", "...yy..", "..yy...", ".y....."],
  play: HEART,
  reboot: ["...a...", ".a.a.a.", "a..a..a", "a.....a", ".a...a.", "..aaa.."],
};