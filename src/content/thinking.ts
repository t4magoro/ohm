// The words for "think": how Ohm got each word of a reply, in plain English. Every number comes from the
// server (`why` on the line message, protocol.ts); this file only turns it into sentences.
import { odds } from "@/lib/format";
import type { Situation, Why, WhyStep } from "@/lib/protocol";

export const END = "</s>";
export const q = (w: string) => `"${w}"`;

/** The words Ohm thought, without the "zzz…" or "beep" the line's text can add. A quote is a whole answer people gave. */
export const wordsOf = (why: Why) =>
  why.quote ? why.quote.words : [why.seed.word, ...why.steps.map((s) => s.word).filter((w) => w !== END)];

/** The title of page 0, in the (!) sheet. */
export const firstTitle = (why: Why) => (why.quote ? "the answer" : "the first word");
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
  const { word, from, situation, lift, cue } = why.seed;
  if (from === "topic") return `He started with ${q(word)}: the rarest word he knew in the message.`;
  if (from === "situation")
    return `Right now ${NOW[situation!]}. People say ${q(word)} ${lift!.toFixed(1)} times more when it's like this, so it was on his mind, and he started there.`;
  if (from === "answer") {
    const learned = `When Ohm says ${q(cue!)}, people answer ${q(word)} ${lift!.toFixed(1)} times more than usual. You said ${q(cue!)}`;
    return why.quote
      ? `${learned}, so he answered like them, with a whole answer people gave ${why.quote.times} times.`
      : `${learned}, so he started his answer there.`;
  }
  if (from === "ask")
    return `He had no answer ready, and you didn't ask him anything, so he asked you something back, like a curious kid (he does that 1 time in 4). He started with ${q(word)}, a question word people use with him.`;
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
    let text =
      chance === 1
        ? `People have said something after ${look}, so he follows them. No dice here: he only babbles after a word nobody continued.`
        : `He's ${sure(chance)} about what comes next (${odds(chance).label}). He rolled the dice: ${followed ? "yes!" : "no, so he looked at just his last word."}`;
    if (followed) {
      const share = s.share!;
      if (s.word === END) text += share === 1 ? " People always stopped there, so he stopped too." : ` He stops there ${odds(share).label} times, and this time he did.`;
      else
        text +=
          share === 1
            ? ` ${q(s.word)} is the only thing people said there, so he said it.`
            : ` From what people said there, he picks ${q(s.word)} ${odds(share).label} times, and this time he did.`;
    }
    return { rung, title, chance, yes: followed, text };
  });
  if (s.stop !== undefined) {
    const stopped = s.word === END;
    out.push({
      rung: "babble",
      title: "babble",
      chance: s.stop,
      yes: stopped,
      text:
        `So he babbled: any word he knows, or stop. After a word, people's sentences end ` +
        `${odds(s.stop).label} times, so he rolled the dice for that: ${stopped ? "stop." : "keep going!"} ` +
        (stopped ? "So he stopped talking." : `He picked a random word he knows: ${q(s.word)}.`),
    });
  }
  return out;
}

/** The short answer next to the dots: on Ohm's screen and in the (!) sheet. */
export const outcome = (r: Row) => (r.rung === "babble" ? (r.yes ? "stop" : "go on") : r.chance === 0 ? "none" : r.yes ? "yes" : "no");

const SCREEN_LABEL = { pair: "2 WORDS", word: "1 WORD", babble: "BABBLE" };
/** The rung's name on Ohm's screen. For the first word, his "last 2 words" are the sentence start and that word. */
export const screenLabel = (rung: Row["rung"], i: number) => (rung === "pair" && i === 0 ? "START" : SCREEN_LABEL[rung]);
/** Page 0 on Ohm's screen: the label on top, and the short reason under the word. */
export const START_LABEL = { topic: "START", situation: "START", random: "START", answer: "ANSWER", ask: "ASK BACK" };
export function startNote({ seed, quote }: Why) {
  if (seed.from === "answer") return `to ${q(seed.cue!)}${quote ? `, said ${quote.times}×` : ""}`;
  return seed.from === "ask" ? "asking you back" : seed.from === "topic" ? "your rarest word" : "a random word";
}
/** On Ohm's screen when the line has no `why`: it came with the page, or he was sulking. */
export const NO_THOUGHTS = "say something and watch me think";

export const LEGEND =
  "Ohm makes a sentence one word at a time. For each word he tries 3 things, in order: " +
  "1. Look at his last 2 words and copy what people said next. " +
  "2. If that doesn't work out, look at just his last word, and follow what people said after it. " +
  "3. Only if nobody said anything after it, babble: say any word he knows, or stop. " +
  "He learns from anyone, like a toddler: what 1 person said gets a quarter of a vote, what 2 people said counts 5 times as much, and " +
  "saying something again doesn't make it count more (people on one Wi-Fi count as one). The dots show how sure he is: very sure when lots of " +
  "people said the same thing there, unsure when everyone said something different. Then he rolls the dice, " +
  "so he doesn't say the same thing every time. And when you say something people usually answer the same way, " +
  "he answers like them.";