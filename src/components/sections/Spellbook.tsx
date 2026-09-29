import { BRAIN_HINTS, LANG_NAMES } from "@/content/spellbook";
import type { Brain } from "@/lib/protocol";

const MAX_LEVEL = 3; // must match brain_level in pet.cpp

/** What Ohm knows: its brain level and its words per language. */
export function Spellbook({ brain }: { brain: Brain }) {
  return (
    <section className="card space-y-2 p-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-pixel text-sm font-bold">Ohm&apos;s Spellbook</h2>
        <p className="flex items-center gap-1.5">
          <span className="font-pixel text-[10px] text-dim">brain</span>
          <span className="sr-only">
            level {brain.level} of {MAX_LEVEL}
          </span>
          {Array.from({ length: MAX_LEVEL }, (_, i) => (
            <span key={i} className={`size-2.5 ${i < brain.level ? "bg-mint" : "bg-edge"}`} />
          ))}
        </p>
      </div>
      <ul className="leading-tight">
        <li>
          knows <span className="text-lemon">{brain.vocab}</span> words
        </li>
        {(Object.keys(LANG_NAMES) as (keyof typeof LANG_NAMES)[]).map((lang) => (
          <li key={lang}>
            *{LANG_NAMES[lang]} <span className="text-dim">lv</span> {brain.langs[lang].level}{" "}
            <span className="text-dim">({brain.langs[lang].words} words)</span>
          </li>
        ))}
      </ul>
      <p className="text-base text-dim">{BRAIN_HINTS[brain.level]}</p>
    </section>
  );
}
