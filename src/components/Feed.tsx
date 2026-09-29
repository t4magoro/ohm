import { MILESTONES, type FeedEvent } from "@/lib/protocol";
import { Log } from "./Log";

// What each event says, and its color in the log.
const TEXT: Record<Exclude<FeedEvent["type"], "taught" | "unlocked">, [string, string]> = {
  charge: ["charged Ohm", "text-lemon"],
  play: ["played with Ohm", "text-pink"],
  reboot: ["rebooted Ohm", "text-lilac"],
  shutdown: ["shut down: its battery ran out", "text-danger"],
};

function describe(e: FeedEvent): [string, string] {
  if (e.type === "taught") return [`taught Ohm "${e.detail}"`, "text-mint"];
  if (e.type === "unlocked") return [`unlocked ${MILESTONES.find((m) => m.id === e.detail)?.part ?? "a new part"}!`, "text-lemon"];
  return TEXT[e.type];
}

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
          <p className="text-dim"># nothing yet. be the first to charge Ohm!</p>
        ) : (
          <ul>
            {[...events].reverse().map((e) => {
              const [text, color] = describe(e);
              return (
                <li key={e.id} className={now - e.at < NEW_MS ? "motion-safe:animate-rise" : ""}>
                  <time className="text-dim" dateTime={new Date(e.at).toISOString()}>
                    {new Date(e.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
