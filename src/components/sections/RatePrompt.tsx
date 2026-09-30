import { RATE_ASK, RATE_THANKS } from "@/content/chat";
import { PixelArt } from "../pixel/PixelArt";
import { FROWN, PAT } from "../pixel/sprites/icons";

/** Ohm asks back under its reply to your latest message: pat or frown. After your vote, only a thank-you stays. */
export function RatePrompt({ vote, onRate }: { vote?: boolean; onRate: (pat: boolean) => void }) {
  if (vote !== undefined) {
    return (
      <li className="flex items-center gap-1.5 pl-4 text-dim motion-safe:animate-rise">
        ↳ <PixelArt art={vote ? PAT : FROWN} title={vote ? "You patted Ohm" : "You frowned at this reply"} className="h-4 w-auto" /> {RATE_THANKS}
      </li>
    );
  }
  return (
    <li className="flex flex-wrap items-center gap-x-1.5 pl-4 text-dim">
      ↳ {RATE_ASK}
      {[true, false].map((pat) => (
        <button
          key={String(pat)}
          type="button"
          onClick={() => onRate(pat)}
          aria-label={pat ? "Pat Ohm for this reply" : "Frown at this reply"}
          className="term-btn flex items-center gap-1 active:translate-y-px"
        >
          <PixelArt art={pat ? PAT : FROWN} className="h-4 w-auto" />
          {pat ? "pat" : "frown"}
        </button>
      ))}
    </li>
  );
}