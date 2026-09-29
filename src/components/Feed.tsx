import { MILESTONES, type FeedEvent } from "@/lib/protocol";

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

/** The live feed as a terminal log: oldest at the top, newest at the bottom, like `tail -f`. */
export function Feed({ events }: { events: FeedEvent[] }) {
  return (
    <section className="term">
      <h2 className="term-bar">
        <span>live feed</span>
      </h2>
      {/* column-reverse keeps the scroll pinned to the newest line, no JavaScript needed. */}
      <div className="flex max-h-64 flex-col-reverse overflow-y-auto px-3 py-2">
        {events.length === 0 ? (
          <p className="text-dim"># nothing yet. be the first to charge Ohm!</p>
        ) : (
          <ul>
            {[...events].reverse().map((e) => {
              const [text, color] = describe(e);
              return (
                <li key={e.id}>
                  <time className="text-dim" dateTime={new Date(e.at).toISOString()}>
                    {new Date(e.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </time>{" "}
                  {e.name} <span className={color}>{text}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
