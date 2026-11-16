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
  "Ohm writes each reply with a small neural network (a transformer) that learned casual Indonesian from thousands of example chats written for him. It reads your message, his battery, mood, the weather, the time of day and his last line to you, writes 8 replies at once, one word at a time, and says the one it's surest of. He keeps learning from everyone: once 3 people use a word his network doesn't know yet, he mixes what they said after it into his replies, and the more people (up to 5), the more it weighs. Words his network already knows stay his own, so a crowd can't bend his everyday talk. One person repeating something can't teach him. Friends on one Wi-Fi count as one person for sentences, but can each teach him what a word goes with (rain, night…), at most once an hour per word. The skills measure what he learns from visitors, before he learns it: words, guessing and context on every message, conversation on every answer to him.";
