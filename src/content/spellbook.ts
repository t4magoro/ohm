// The Spellbook's words: how Ohm learns, and what each skill measures (see "How Ohm learns to talk" in the ohm-api README).

export const LANG_NAMES = { id: "Indonesian", en: "English" } as const;

/** [skill, label, what it measures]. Each skill is the share of hits over about the last 100 tries. */
export const SKILLS = [
  ["words", "words", "how often a word you type is one Ohm already knows."],
  ["sentences", "sentences", "how often two known words come in an order Ohm has seen before."],
  ["context", "context", "how often a word Ohm links to a situation (rain, night, charging…) is used while that situation is on."],
  ["expression", "expression", "how many of the replies people rated got a pat."],
] as const;

export const LEARNING =
  "Ohm learns from the very first message. Where it has no evidence it babbles (a reply of pure babble ends with “beep”); where it has, it speaks in sentences. It only repeats a word pattern once two different people have typed it. The skills are measured on every message, before Ohm learns from it.";
