import { describe, EMPTY_FEED } from "@/content/feed";
import { timeOfDay } from "@/lib/format";
import type { FeedEvent } from "@/lib/protocol";
import { Log } from "../ui/Log";

const NEW_MS = 5_000; // a line this young slides in; older ones (loaded with the page) just sit there

/** The live feed as a terminal log. `now` is server time, to spot the lines that just arrived. */
export function Feed({ events, now }: { events: FeedEvent[]; now: number }) {
  return (
    <section className="term flex h-full flex-col">
      <h2 className="term-bar">
        <span>live feed</span>
      </h2>
      <Log label="Live feed">
        {events.length === 0 ? (
          <p className="text-dim">{EMPTY_FEED}</p>
        ) : (
          <ul>
            {[...events].reverse().map((e) => {
              const [text, color] = describe(e);
              return (
                <li key={e.id} className={now - e.at < NEW_MS ? "motion-safe:animate-rise" : ""}>
                  <time className="text-dim" dateTime={new Date(e.at).toISOString()}>
                    {timeOfDay(e.at)}
                  </time>{" "}
                  {e.name} <span className={color}>{text}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Log>
    </section>
  );
}
