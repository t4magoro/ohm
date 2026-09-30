import { LANG_NAMES, LEARNING, SKILLS } from "@/content/spellbook";
import type { Brain } from "@/lib/protocol";
import { StatBar } from "../ui/StatBar";

const LANGS = Object.keys(LANG_NAMES) as (keyof typeof LANG_NAMES)[];

/** What Ohm knows: its words, and four skills measured on every message. No combined score: they measure different things. */
export function Spellbook({ brain }: { brain: Brain }) {
  return (
    <section className="card space-y-2 p-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-pixel text-sm font-bold">Ohm&apos;s Spellbook</h2>
        <p>
          knows <span className="text-lemon">{brain.vocab}</span> words
        </p>
      </div>
      {SKILLS.map(([skill, label]) => (
        <StatBar key={skill} label={label} value={brain.skills[skill] * 100} color="bg-mint" wide />
      ))}
      <p className="text-base text-dim">{LANGS.map((lang) => `${LANG_NAMES[lang]} ${brain.langs[lang].words}`).join(" · ")}</p>
      <details className="group text-base leading-snug text-dim">
        <summary className="cursor-pointer list-none text-lemon [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">[+] how Ohm learns</span>
          <span className="hidden group-open:inline">[-] how Ohm learns</span>
        </summary>
        <p className="mt-1">{LEARNING}</p>
        <dl className="mt-1 space-y-0.5">
          {SKILLS.map(([skill, label, meaning]) => (
            <div key={skill}>
              <dt className="inline text-mint">{label}:</dt> <dd className="inline">{meaning}</dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  );
}