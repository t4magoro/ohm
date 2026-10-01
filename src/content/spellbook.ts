// The Spellbook's words: how Ohm learns, and what each skill measures (see "How Ohm learns to talk" in the ohm-api README).

export const LANG_NAMES = { id: "Indonesian", en: "English" } as const;

/** [skill, label, what it measures]. Each skill is the share of hits over about the last 100 tries. */
export const SKILLS = [
  ["words", "words", "how often a word you type is one Ohm already knows."],
  ["sentences", "sentences", "how much of what Ohm says follows a word pattern people taught him (the rest is babble)."],
  ["context", "context", "how often a word Ohm links to a situation (rain, night, charging…) is used while that situation is on."],
  ["expression", "expression", "how many of the replies people rated got a pat."],
] as const;

export const LEARNING =
  "Ohm learns from the very first message. Where it has no evidence it babbles (a reply of pure babble ends with “beep”); where it has, it speaks in sentences. It only repeats a word pattern once people on two different internet connections have typed it, but friends on one Wi-Fi can each teach it what a word goes with (rain, night…). The skills are measured before Ohm learns: words and context on every message, sentences on every word Ohm says.";
