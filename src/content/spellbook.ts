// The Spellbook's words.

export const LANG_NAMES = { id: "Indonesian", en: "English" } as const;

/** What the next brain level brings, by current level. Must match brain_level in pet.cpp. */
export const BRAIN_HINTS = [
  "",
  "At 50 words, Ohm starts following the word before.",
  "At 300 words, Ohm remembers two words back.",
  "Ohm's brain is fully grown. Keep teaching it words!",
];
