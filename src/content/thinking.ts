// The words for "think": how Ohm got each word of a reply, in plain English. Every number comes from the
// server (`why` on the line message, protocol.ts); this file only turns it into sentences.
import { odds } from "@/lib/format";
import type { Situation, Why, WhyStep } from "@/lib/protocol";

export const END = "</s>";
export const q = (w: string) => `"${w}"`;

/** The words Ohm thought, without the "zzz…" or "beep" the line's text can add. */
export const wordsOf = (why: Why) => [why.seed.word, ...why.steps.map((s) => s.word).filter((w) => w !== END)];

/** Which rung made the word: the one he followed, else babble. */
export const rungOf = (s: WhyStep) => s.tried.find((t) => t.followed)?.rung ?? "babble";

const sure = (p: number) => (p >= 0.75 ? "very sure" : p >= 0.5 ? "fairly sure" : p >= 0.25 ? "a little sure" : "not very sure");

const NOW: Record<Situation, string> = {
  rain: "it's raining",
  hot: "it's hot",
  pagi: "it's morning",
  siang: "it's midday",
  sore: "it's afternoon",
  malam: "it's night",
  battery_low: "Ohm's battery is low",
  mood_low: "Ohm's mood is low",
  charge: "someone just charged Ohm",
  play: "someone just played with Ohm",
  reboot: "Ohm just rebooted",
};

export function startText(why: Why) {
  const { word, from, situation, lift } = why.seed;
  if (from === "topic") return `He started with ${q(word)}: the rarest word he knew in the message.`;
  if (from === "situation")
    return `Right now ${NOW[situation!]}. People say ${q(word)} ${lift!.toFixed(1)} times more when it's like this, so it was on his mind, and he started there.`;
  return `He didn't know any of the words, so he started with a random word he knows: ${q(word)}.`;
}

/** One row per thing Ohm tried for word i + 1, in order: his last 2 words, his last word, babble. */
export type Row = { rung: "pair" | "word" | "babble"; title: string; chance: number; yes: boolean; text: string };

export function rows(why: Why, i: number): Row[] {
  const words = [why.seed.word, ...why.steps.map((s) => s.word)];
  const [p2, p1] = [i > 0 ? words[i - 1] : null, words[i]];
  const s = why.steps[i];
  const out: Row[] = s.tried.map(({ rung, chance, followed }) => {
    const look = rung === "word" ? q(p1) : p2 ? q(`${p2} ${p1}`) : `${q(p1)} at the start of a sentence`;
    const title = rung === "word" ? `his last word ${look}` : p2 ? `his last 2 words ${look}` : `sentences that start with ${q(p1)}`;
    if (chance === 0) return { rung, title, chance, yes: false, text: `Nobody has taught him what comes after ${look} yet.` };
    let text = `He's ${sure(chance)} about what comes next (${odds(chance).label}). He rolled the dice: ${followed ? "yes!" : "no."}`;
    if (followed) {
      const share = s.share!;
      if (s.word === END) text += share === 1 ? " People always stopped there, so he stopped too." : ` People stopped there ${odds(share).label} times, and so did he.`;
      else
        text +=
          share === 1
            ? ` ${q(s.word)} is the only thing people said there, so he said it.`
            : ` He picked from what people said there: ${q(s.word)} comes up ${odds(share).label} times, and it came up.`;
    }
    return { rung, title, chance, yes: followed, text };
  });
  if (s.stop !== undefined) {
    const rolls = s.tried.filter((t) => t.chance > 0).length;
    const reason = rolls === 0 ? "Nobody taught him anything here" : rolls === 1 ? "The roll said no" : "Both rolls said no";
    const stopped = s.word === END;
    out.push({
      rung: "babble",
      title: "babble",
      chance: s.stop,
      yes: stopped,
      text:
        `${reason}, so he babbled: any word he knows, or stop. After a word, people's sentences end ` +
        `${odds(s.stop).label} times, so he rolled the dice for that: ${stopped ? "stop." : "keep going!"} ` +
        (stopped ? "So he stopped talking." : `He picked a random word he knows: ${q(s.word)}.`),
    });
  }
  return out;
}

/** The short answer next to the dots: on Ohm's screen and in the (!) sheet. */
export const outcome = (r: Row) => (r.rung === "babble" ? (r.yes ? "stop" : "go on") : r.chance === 0 ? "none" : r.yes ? "yes" : "no");

export const SCREEN_LABEL = { pair: "2 WORDS", word: "1 WORD", babble: "BABBLE" };
/** On Ohm's screen when the line has no `why`: it came with the page, or he was sulking. */
export const NO_THOUGHTS = "say something and watch me think";

export const LEGEND =
  "Ohm makes a sentence one word at a time. For each word he tries 3 things, in order: " +
  "1. Look at his last 2 words and copy what people said next. " +
  "2. If that doesn't work out, look at just his last word. " +
  "3. If that doesn't work either, babble: say any word he knows, or stop. " +
  "He learns from anyone, like a toddler, but what 2 people said counts 3 times as much as what 1 person said, and " +
  "saying something again doesn't make it count more (people on one Wi-Fi count as one). The dots show how sure he is: very sure when lots of "+
  "people said the same thing there, unsure when everyone said something different. Then he rolls the dice, " +
  "so he doesn't say the same thing every time.";