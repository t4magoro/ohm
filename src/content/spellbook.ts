// The Spellbook's words: how Ohm learns, and what each skill measures (see "How Ohm learns to talk" in the ohm-api README).

export const LANG_NAMES = { id: "Indonesian", en: "English" } as const;

/** [skill, label, what it measures]. Each skill is the share of hits over about the last 100 tries. */
export const SKILLS = [
  ["words", "words", "how often a word you type is one Ohm already knows."],
  ["guessing", "guessing", "how often Ohm's best guess for your next word (or the end of your sentence) is the one you type. It jumped on 7 Nov 2026, when Tatoeba's word patterns arrived."],
  ["context", "context", "how often a word Ohm links to a situation (rain, night, charging…) is used while that situation is on."],
  ["expression", "expression", "how many of the replies people rated got a pat."],
  ["conversation", "conversation", "when Ohm has learned what people answer to something he says, how often you answer it that way."],
] as const;

export const LEARNING =
  "Ohm starts with lines of his own for things people often say, and with how words follow each other in Tatoeba's example sentences. Everything else he learns from the very first message: once 3 people say the same thing after a word, he says what they taught. It follows what people said wherever it can, and only babbles after a word nobody has continued yet (a reply of pure babble ends with “beep”). It learns sentences from anyone, like a toddler: what one person said gets a quarter of a vote, what two people said counts five times as much, and repeating something doesn't make it count more. Friends on one Wi-Fi count as one person for sentences, but can each teach it what a word goes with (rain, night…), at most once an hour per word. The skills are measured before Ohm learns: words, guessing and context on every message, conversation on every answer to him.";
