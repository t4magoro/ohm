// "Show the maths" in the (!) sheet: Ohm's sums for each thing he tried, step by step, every number coloured by what
// it means (the same colours as the bars under them), then the dice he threw. Every number comes from `why`
// (protocol.ts); this file only does the arithmetic people can check.
import { odds } from "@/lib/format";
import { DISCOUNT, SITUATION_CHANCE, type Why, type WhyStep } from "@/lib/protocol";
import { END, NOW, q, START, stepAt, type Row } from "./thinking";

/** What a number means, and so its colour: votes, given to something new, kept, the picked word, a die, the verdict. */
export type Tone = "votes" | "new" | "kept" | "pick" | "die" | "yes" | "no";
/** One step of a sum: numbers (with a tone) and the words and signs between them (without). */
export type Token = { text: string; tone?: Tone };
/** A bar of votes. Segments in order; the die lands at `at`, 0 to 1 across the whole bar. */
export type Seg = { size: number; tone: "pick" | "kept" | "votes" | "new" | "stop" | "fill" | "rest"; label: string };
export type Bar = { segs: Seg[]; die?: { at: number; second?: boolean }; caption: string };
/** `die`: the step that is a die roll, so the page can say once what his die is. */
export type Maths = { intro: string; steps: Token[][]; die?: number; bars: Bar[]; formula: string };

/** Said before the first die on a page (a friend asked how Ohm "calculates" 0.87: he doesn't, it's random). */
export const DIE_NOTE = "His die (a random number from 0 to 1, every number equally likely):";

const D = DISCOUNT;
const num = (x: number) => String(Math.round(x * 100) / 100); // 3.75, 2.25, 1.5
const pc = (p: number) => `${p < 0.1 && p > 0 ? (p * 100).toFixed(1) : Math.round(p * 100)}%`;
const die = (x: number) => x.toFixed(2);
const votes = (count: number) => `${count} ${count === 1 ? "vote" : "votes"}`;
const nameOf = (word: string) => (word === END ? "the end" : word === START ? "the start" : q(word));
const n = (text: string, tone: Tone): Token => ({ text, tone });
const t = (text: string): Token => ({ text });
/** "His die: 0.87 is not below 0.55 follow → something new". */
const roll = (value: number, against: Token, yes: boolean, said: string): Token[] => [
  t("His die:"),
  n(die(value), "die"),
  t(yes ? "is below" : "is not below"),
  against,
  t("→"),
  n(said, yes ? "yes" : "no"),
];

/**
 * One rung he tried: the votes there, what "something new" takes, his die, and the pick. Null when nobody taught him.
 * `left`: growing to the left, where the votes are for words before it.
 */
function rung(tr: WhyStep["tried"][number], s: WhyStep, left: boolean): Maths | null {
  if (tr.chance === 0) return null;
  const gave = D * tr.options;
  const kept = tr.votes - gave;
  const words = left ? `${tr.options} ${tr.options === 1 ? "word" : "words"} before it` : tr.options === 1 ? "1 next word" : `${tr.options} next words`;
  const steps: Token[][] = [
    [n(words, "votes"), t("×"), n("¾", "new"), t("="), n(`${num(gave)} to something new`, "new")],
    [n(votes(tr.votes), "votes"), t("−"), n(num(gave), "new"), t("="), n(`${num(kept)} kept`, "kept")],
  ];
  let rolled: number | undefined;
  if (tr.roll !== undefined) {
    steps.push([n(num(kept), "kept"), t("÷"), n(votes(tr.votes), "votes"), t("="), n(`${pc(tr.chance)} follow`, "kept")]);
    rolled = steps.length;
    steps.push(roll(tr.roll, n(`${die(tr.chance)} follow`, "kept"), tr.followed, tr.followed ? "follow" : "something new: look further"));
  } else steps.push([t("Someone continued this word, so he follows:"), n("no dice", "yes")]);

  const pick = tr.followed && s.picked !== undefined ? s.picked - D : 0;
  const name = nameOf(s.word);
  if (pick > 0 && s.share === 1) steps.push([n(name, "pick"), t("is the only next word →"), n("100%", "pick")]);
  else if (pick > 0)
    steps.push(
      [n(`${votes(s.picked!)} for ${name}`, "pick"), t("−"), n("¾", "new"), t("="), n(num(pick), "pick")],
      [n(num(pick), "pick"), t("÷"), n(`${num(kept)} kept`, "kept"), t("="), n(`${pc(s.share!)} ${name}`, "pick")],
    );

  // Two throws, two bars: follow or "something new" across all the votes, then which word across the kept ones.
  const bars: Bar[] = [];
  if (tr.roll !== undefined)
    bars.push({
      segs: [
        { size: kept, tone: "fill", label: `follow ${num(kept)}` },
        { size: gave, tone: "new", label: `something new ${num(gave)}` },
      ],
      die: { at: tr.roll },
      caption: `die ${die(tr.roll)}: ${tr.followed ? "follow" : "something new, so he looks further"}`,
    });
  if (pick > 0)
    bars.push({
      segs: [
        { size: pick, tone: "pick", label: `${name} ${num(pick)}` },
        { size: kept - pick, tone: "kept", label: kept - pick > 0.001 ? `other words ${num(kept - pick)}` : "" },
      ],
      die: s.pickAt === undefined ? undefined : { at: (s.pickAt * pick) / kept, second: true },
      caption: `${tr.roll !== undefined ? "second die" : "his die"}: ${name}`,
    });
  return {
    intro: `${votes(tr.votes)} for ${words}. Each of them gives ¾ of a vote to "something new", a word nobody said here yet.`,
    steps,
    die: rolled,
    bars,
    formula: "follow = (votes − ¾ × words) ÷ votes · pick = (its votes − ¾) ÷ kept",
  };
}

/** Babble: how often people's sentences end (or start, growing left), and his die for stopping. */
function babble(s: WhyStep, left: boolean): Maths | null {
  if (s.stop === undefined || s.ends === undefined || s.heard === undefined || s.stopRoll === undefined) return null;
  const stopped = s.word === (left ? START : END);
  const stop = left ? "start" : "stop";
  const steps: Token[][] =
    s.heard === 0
      ? [[t("He hasn't heard a sentence end yet →"), n(stop, "no")]]
      : [
          [n(`${s.ends} sentence ends`, "votes"), t("÷"), n(`${s.heard} words and ends heard`, "votes"), t("="), n(`${pc(s.stop)} ${stop}`, "new")],
          roll(s.stopRoll, n(`${die(s.stop)} ${stop}`, "new"), stopped, stopped ? stop : `go on: ${q(s.word)}`),
        ];
  return {
    intro: left
      ? "Nobody said anything before this word, so he babbles: he starts the sentence as often as people's sentences end, or says any word he knows."
      : "Nobody continued his last word, so he babbles: he stops as often as people's sentences end, or says any word he knows.",
    steps,
    die: s.heard === 0 ? undefined : 1,
    bars: [
      {
        segs: [
          { size: s.stop, tone: "stop", label: `${stop} ${pc(s.stop)}` },
          { size: 1 - s.stop, tone: "rest", label: `go on ${pc(1 - s.stop)}` },
        ],
        die: { at: s.stopRoll },
        caption: `die ${die(s.stopRoll)}: ${stopped ? stop : "go on"}`,
      },
    ],
    formula: `${stop} = sentence ends ÷ words and ends heard`,
  };
}

/** The maths under one row of the ladder for step i. */
export function rowMaths(why: Why, i: number, row: Row): Maths | null {
  const { s, left } = stepAt(why, i);
  if (row.rung === "babble") return babble(s, left);
  const tr = s.tried.find((x) => x.rung === row.rung);
  return tr ? rung(tr, s, left) : null;
}

/** Page 0: the counts behind a lift, and the die between his situation and your topic. Null when there's nothing to show. */
export function startMaths({ seed }: Why): Maths | null {
  const { counts, situation, cue, word } = seed;
  const steps: Token[][] = [];
  const bars: Bar[] = [];
  const intro: string[] = [];
  if (counts && seed.lift !== undefined) {
    const mine = counts.n / counts.of;
    const all = counts.all / counts.total;
    const times = `${seed.lift.toFixed(1)} times more`;
    if (seed.from === "situation") {
      intro.push(`Of all the times people said ${q(word)}, how many were while ${NOW[situation!]}? And of all the words people said?`);
      steps.push([n(`${q(word)}: ${counts.n} of ${counts.of} times`, "pick"), t("="), n(pc(mine), "pick")]);
      steps.push([n(`all words: ${counts.all} of ${counts.total} times`, "votes"), t("="), n(pc(all), "votes")]);
    } else {
      intro.push(`Of all the answers to ${q(cue!)}, how many had ${q(word)}? And of all the answers to anything?`);
      steps.push([n(`with ${q(word)}: ${counts.n} of ${counts.of} answers`, "pick"), t("="), n(pc(mine), "pick")]);
      steps.push([n(`all answers: ${counts.all} of ${counts.total}`, "votes"), t("="), n(pc(all), "votes")]);
    }
    steps.push([n(pc(mine), "pick"), t("÷"), n(pc(all), "votes"), t("="), n(times, "kept")]);
    const share = (size: number, tone: Seg["tone"], label: string, caption = ""): Bar => ({
      segs: [
        { size, tone, label },
        { size: 1 - size, tone: "rest", label: "" },
      ],
      caption,
    });
    bars.push(share(mine, "pick", `${seed.from === "situation" ? q(word) : `with ${q(word)}`} ${pc(mine)}`));
    bars.push(share(all, "votes", `everything ${pc(all)}`, times));
  }
  let rolled: number | undefined;
  if (seed.roll !== undefined) {
    const yes = seed.roll < SITUATION_CHANCE;
    intro.push(`He had a word for his situation and one of yours, and talks about his situation ${odds(SITUATION_CHANCE).label} times.`);
    rolled = steps.length;
    steps.push(roll(seed.roll, n(`${die(SITUATION_CHANCE)} his situation`, "kept"), yes, yes ? "his situation" : "your word"));
    bars.push({
      segs: [
        { size: SITUATION_CHANCE, tone: "fill", label: `his situation ${pc(SITUATION_CHANCE)}` },
        { size: 1 - SITUATION_CHANCE, tone: "rest", label: `your word ${pc(1 - SITUATION_CHANCE)}` },
      ],
      die: { at: seed.roll },
      caption: `die ${die(seed.roll)}: ${yes ? "his situation" : "your word"}`,
    });
  }
  if (steps.length === 0) return null;
  return { intro: intro.join(" "), steps, die: rolled, bars, formula: counts ? "times more = its share ÷ everyone's share" : "" };
}