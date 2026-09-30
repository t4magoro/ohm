import type { Away } from "@/hooks/useOhm";
import { plural } from "@/lib/format";
import { WELCOME } from "@/content/about";

/** "While you were away, Ohm learned 14 new words and shut down 1 time. …" */
function awayText(a: Away) {
  const news = [
    a.learned > 0 && `learned ${plural(a.learned, "new word")}`,
    a.shutdowns > 0 && `shut down ${plural(a.shutdowns, "time")}`,
  ];
  const said = a.said > 0 ? ` It has used the words you taught ${plural(a.said, "time")} so far.` : "";
  return `While you were away, Ohm ${news.filter(Boolean).join(" and ")}.${said}`;
}

/** What happened since your last visit (or, on your first visit, what Ohm is), floating on top until you dismiss it. */
export function AwayBanner({ away, onDismiss }: { away: Away | "first"; onDismiss: () => void }) {  return (
    // Waits while you type on a phone (typing mode), so it doesn't cover the chat.
    <div className="term 
                    fixed 
                    inset-x-3 
                    top-3 
                    z-30 
                    flex 
                    items-start 
                    gap-2 
                    px-3 
                    py-2 
                    motion-safe:animate-pop 
                    motion-reduce:animate-fade 
                    max-lg:group-has-[input:focus]/page:hidden 
                    lg:left-auto 
                    lg:right-6 
                    lg:top-6 
                    lg:w-96">
      <p className="flex-1">
        <span className="text-mint">ohm&gt;</span> 
          {away === "first" ? WELCOME : awayText(away)}
      </p>
      <button type="button" className="term-btn" onClick={onDismiss}>
        [ok]
      </button>
    </div>
  );
}
