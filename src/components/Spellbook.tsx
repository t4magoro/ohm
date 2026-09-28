import type { Brain } from "@/lib/protocol";

const LANGS = { id: "Indonesian", en: "English" } as const;

// Must match brain_level in pet.cpp.
const NEXT = [
  "",
  "At 50 words, Ohm starts following the word before.",
  "At 300 words, Ohm remembers two words back.",
  "Ohm's brain is fully grown. Keep teaching it words!",
];

export function Spellbook({ brain }: { brain: Brain }) {
  return (
    <section className="space-y-1 text-sm">
      <h2 className="font-bold">Ohm&apos;s Spellbook</h2>
      <p>
        🧠 Brain Lv {brain.level} · knows {brain.vocab} words
      </p>
      <ul>
        {(Object.keys(LANGS) as (keyof typeof LANGS)[]).map((lang) => (
          <li key={lang}>
            {LANGS[lang]}: Lv {brain.langs[lang].level} ({brain.langs[lang].words} words)
          </li>
        ))}
      </ul>
      <p className="text-xs opacity-70">{NEXT[brain.level]}</p>
    </section>
  );
}