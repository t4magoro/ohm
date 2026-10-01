import { LIFT_NOTE, NO_LINKS, SITUATION_LABEL } from "@/content/vitals";
import type { Vitals } from "@/lib/protocol";
import { PixelArt } from "../pixel/PixelArt";
import { SITUATION_ICONS } from "../pixel/sprites/situations";

/** The words Ohm links to a situation (rain, night, charging…), strongest first. Each link rests on 2+ browsers using the word in that situation. */
export function Understands({ links }: { links: Vitals["links"] }) {
  return (
    <section className="card space-y-2 p-3">
      <h2 className="font-pixel text-sm font-bold">What Ohm understands</h2>
      {links.length === 0 ? (
        <p className="text-dim">{NO_LINKS}</p>
      ) : (
        <>
          <ul className="divide-y-2 divide-edge">
            {links.map((l) => (
              <li key={l.word} className="flex items-center gap-2 py-1">
                <PixelArt art={SITUATION_ICONS[l.situation]} className="h-5 w-auto shrink-0" />
                <span className="text-lemon">{l.word}</span>
                <span className="text-dim">→ {SITUATION_LABEL[l.situation]}</span>
                <span className="ml-auto text-base text-dim">{l.lift.toFixed(1)}× usual</span>
              </li>
            ))}
          </ul>
          <p className="text-base text-dim">{LIFT_NOTE}</p>
        </>
      )}
    </section>
  );
}