// The words for "think": how Ohm got each word of a reply, in plain English. Every number comes from the
// server (`why` on the line message, protocol.ts); this file only turns it into sentences.
import { odds } from "@/lib/format";
import type { Situation, Why, WhyStep } from "@/lib/protocol";

export const END = "</s>";
export const START = "<s>";
export const q = (w: string) => `"${w}"`;

/** The words Ohm thought, without the "zzz…" or "beep" the line's text can add. A quote is a whole answer people gave. */
export const wordsOf = (why: Why) =>
  why.quote
    ? why.quote.words
    : [
        ...(why.back ?? []).map((s) => s.word).filter((w) => w !== START).reverse(),
        why.seed.word,
        ...why.steps.map((s) => s.word).filter((w) => w !== END),
      ];

/** Every step, in the order he made them: the words after his start, then the words he grew to the left of it. */
export const stepsOf = (why: Why) => [...why.steps, ...(why.back ?? [])];
/** The replay's pages: the start, every step, then best of 5 when he made 5 tries. */
export const pagesOf = (why: Why) => stepsOf(why).length + 1 + (why.tries ? 1 : 0);
/** Whether a page is best of 5: the last one, after every step. */
export const isBest = (why: Why, page: number) => !!why.tries && page === stepsOf(why).length + 1;
/** How many of a try's word pairs 2+ people typed. */
export const crowdOf = (t: { crowd: boolean[] }) => t.crowd.filter(Boolean).length;

/** Best of 5's label on Ohm's screen, and in the (!) sheet: the key under the lanes and the try he said. */
export const bestLabel = (why: Why) => `BEST OF ${why.tries!.length}`;
export const BEST_KEY = "lemon link = a word pair 2+ people typed · score = those pairs ÷ all its pairs";
export const SAID = "said";

/** Best of 5, in words: why he said the try he said. */
export function bestText(why: Why) {
  const best = why.tries![why.chosen!];
  return (
    `He made ${why.tries!.length} tries from the same start, each with its own dice, and said the one whose word pairs ` +
    `the most people typed: ${crowdOf(best)} of its ${best.crowd.length} pairs were typed by 2 or more people. ` +
    `(A tie goes to the longer try, then the first.)`
  );
}

/** The sentence as it stood after a page, in order, and which word that page added (Ohm's screen shows it). */
export function soFar(why: Why, page: number) {
  const steps = stepsOf(why);
  const forward = why.steps.slice(0, Math.min(page, why.steps.length)).map((s) => s.word);
  const back = steps.slice(why.steps.length, page).map((s) => s.word);
  const words = [...back.filter((w) => w !== START).reverse(), why.seed.word, ...forward.filter((w) => w !== END)];
  const made = page > 0 && page <= steps.length ? steps[page - 1].word : null;
  const left = page > why.steps.length;
  return { words, fresh: made === null || made === END || made === START ? -1 : left ? 0 : words.length - 1, left };
}

/**
 * Step i, and what he read for it. Going right: his last word `near` and the one before it, `far` (null at the
 * start of a sentence). Growing left: his first word `near` and the one after it, `far` (END after a last word).
 */
export function stepAt(why: Why, i: number) {
  const right = [why.seed.word, ...why.steps.map((s) => s.word)];
  if (i < why.steps.length) return { s: why.steps[i], left: false, near: right[i], far: i > 0 ? right[i - 1] : null };
  const k = i - why.steps.length;
  const before = [...why.back!.slice(0, k).map((s) => s.word).reverse(), ...right];
  return { s: why.back![k], left: true, near: before[0], far: before[1] ?? END };
}

/** Which word of wordsOf(why) a page is about: -1 when it's where he stopped, or where a sentence starts. */
export function litOf(why: Why, page: number) {
  if (why.quote) return why.quote.words.indexOf(why.seed.word); // in a quote, the answer word
  if (isBest(why, page)) return -1;
  const before = (why.back ?? []).filter((s) => s.word !== START).length;
  if (page === 0) return before;
  const { s, left } = stepAt(why, page - 1);
  if (s.word === END || s.word === START) return -1;
  return left ? before - (page - why.steps.length) : before + page;
}

/** The (!) sheet's title for a page. */
export function pageTitle(why: Why, page: number) {
  if (page === 0) return firstTitle(why);
  if (isBest(why, page)) return "best of 5";
  const { s } = stepAt(why, page - 1);
  return s.word === END ? "the end" : s.word === START ? "the start" : `word ${litOf(why, page) + 1}`;
}

/** What he did on a page, at the bottom of the (!) sheet. */
export function madeText(why: Why, page: number) {
  if (page === 0) return `he says ${q(wordsOf(why).join(" "))}`; // a quote is said whole
  if (isBest(why, page)) return `he says try ${why.chosen! + 1}: ${q(wordsOf(why).join(" "))}`;
  const { s, left } = stepAt(why, page - 1);
  if (s.word === END) return "he stops talking";
  if (s.word === START) return "a sentence starts here, so he stops growing";
  return left ? `he puts ${q(s.word)} in front` : `he says ${q(s.word)}`;
}

/** The title of page 0, in the (!) sheet. */
export const firstTitle = (why: Why) => (why.quote ? "the answer" : "the first word");
/** Which rung made the word: the one he followed, else babble. */
export const rungOf = (s: WhyStep) => s.tried.find((t) => t.followed)?.rung ?? "babble";

const sure = (p: number) => (p >= 0.75 ? "very sure" : p >= 0.5 ? "fairly sure" : p >= 0.25 ? "a little sure" : "not very sure");

export const NOW: Record<Situation, string> = {
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

/** One row per thing Ohm tried for step i (stepsOf), in order: 2 words, 1 word, babble. */
export type Row = { rung: "pair" | "word" | "babble"; title: string; chance: number; yes: boolean; text: string };

export function rows(why: Why, i: number): Row[] {
  const { s, left, near, far } = stepAt(why, i);
  const way = left ? "before" : "after";
  const one = left ? "the word after it" : "his last word";
  const two = left ? (far === END ? null : `${near} ${far}`) : far && `${far} ${near}`; // null: a sentence's edge
  const edge = left ? "end" : "start";
  const out: Row[] = s.tried.map(({ rung, chance, followed }) => {
    const look = rung === "word" ? q(near) : two ? q(two) : `${q(near)} at the ${edge} of a sentence`;
    const title = rung === "word" ? `${one} ${look}` : two ? `${left ? "the 2 words after it" : "his last 2 words"} ${look}` : `sentences that ${edge} with ${q(near)}`;
    if (chance === 0) return { rung, title, chance, yes: false, text: `Nobody has taught him what comes ${way} ${look} yet.` };
    let text =
      chance === 1
        ? `People have said something ${way} ${look}, so he follows them. No dice here: he only babbles when nobody has.`
        : `He's ${sure(chance)} about what comes ${left ? "before" : "next"} (${odds(chance).label}). He rolled the dice: ${followed ? "yes!" : `no, so he looked at just ${one}.`}`;
    if (followed) {
      const share = s.share!;
      if (s.word === START)
        text += share === 1 ? " People always started a sentence there, so he stopped growing." : ` A sentence starts there ${odds(share).label} times, and this time it did.`;
      else if (s.word === END) text += share === 1 ? " People always stopped there, so he stopped too." : ` He stops there ${odds(share).label} times, and this time he did.`;
      else
        text +=
          share === 1
            ? ` ${q(s.word)} is the only thing people said there, so he said it.`
            : ` From what people said there, he picks ${q(s.word)} ${odds(share).label} times, and this time he did.`;
    }
    return { rung, title, chance, yes: followed, text };
  });
  if (s.stop !== undefined) {
    const stopped = s.word === (left ? START : END);
    out.push({
      rung: "babble",
      title: "babble",
      chance: s.stop,
      yes: stopped,
      text: left
        ? `So he babbled: any word he knows, or start the sentence here. Sentences start ${odds(s.stop).label} times ` +
          `(as often as they end), so he rolled the dice for that: ${stopped ? "start." : "keep going!"} ` +
          (stopped ? "So he stopped growing." : `He picked a random word he knows: ${q(s.word)}.`)
        : `So he babbled: any word he knows, or stop. After a word, people's sentences end ` +
          `${odds(s.stop).label} times, so he rolled the dice for that: ${stopped ? "stop." : "keep going!"} ` +
          (stopped ? "So he stopped talking." : `He picked a random word he knows: ${q(s.word)}.`),
    });
  }
  return out;
}

/** The short answer next to the dots: on Ohm's screen and in the (!) sheet. */
export const outcome = (r: Row) => (r.rung === "babble" ? (r.yes ? "stop" : "go on") : r.chance === 0 ? "none" : r.yes ? "yes" : "no");

const SCREEN_LABEL = { pair: "2 WORDS", word: "1 WORD", babble: "BABBLE" };
/** The rung's name on Ohm's screen. At a sentence's edge, the "2 words" are its start (or end) and one word. */
export function screenLabel(why: Why, rung: Row["rung"], i: number) {
  const { left, far } = stepAt(why, i);
  if (rung !== "pair") return SCREEN_LABEL[rung];
  return left ? (far === END ? "END" : SCREEN_LABEL.pair) : far === null ? "START" : SCREEN_LABEL.pair;
}
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
  "Then, if he started from your word, his situation or a random word, he does the same to the left: words before " +
  "his first one, until a sentence starts. He makes 5 tries like that and says the one whose word pairs the most " +
  "people typed. " +
  "He learns from anyone, like a toddler: what 1 person said gets a quarter of a vote, what 2 people said counts 5 times as much, and " +
  "saying something again doesn't make it count more (people on one Wi-Fi count as one). The dots show how sure he is: very sure when lots of " +
  "people said the same thing there, unsure when everyone said something different. Then he rolls the dice, " +
  "so he doesn't say the same thing every time. And when you say something people usually answer the same way, " +
  "he answers like them.";