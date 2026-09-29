import { MILESTONES, type FeedEvent } from "@/lib/protocol";

const TEXT: Record<Exclude<FeedEvent["type"], "taught" | "unlocked">, string> = {
  charge: "charged Ohm ⚡",
  play: "played with Ohm 🎈",
  reboot: "rebooted Ohm 🔁",
  shutdown: "shut down: its battery ran out 🪫",
};

function describe(e: FeedEvent) {
  if (e.type === "taught") return `taught Ohm: ${e.detail} 📚`;
  if (e.type === "unlocked") return `unlocked ${MILESTONES.find((m) => m.id === e.detail)?.part ?? "a new part"} 🎉`;
  return TEXT[e.type];
}

export function Feed({ events }: { events: FeedEvent[] }) {
  if (events.length === 0) return <p className="text-sm opacity-70">Nothing yet. Be the first to charge Ohm!</p>;
  return (
    <ul className="space-y-1 text-sm">
      {events.map((e) => (
        <li key={e.id}>
          <time className="opacity-70" dateTime={new Date(e.at).toISOString()}>
            {new Date(e.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </time>{" "}
          <b>{e.name}</b> {describe(e)}
        </li>
      ))}
    </ul>
  );
}