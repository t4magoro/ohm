import type { FeedEvent } from "@/lib/protocol";

const TEXT: Record<FeedEvent["type"], string> = {
  charge: "charged Ohm ⚡",
  play: "played with Ohm 🎈",
  reboot: "rebooted Ohm 🔁",
  shutdown: "shut down: its battery ran out 🪫",
};

export function Feed({ events }: { events: FeedEvent[] }) {
  if (events.length === 0) return <p className="text-sm opacity-70">Nothing yet. Be the first to charge Ohm!</p>;
  return (
    <ul className="space-y-1 text-sm">
      {events.map((e) => (
        <li key={e.id}>
          <time className="opacity-70" dateTime={new Date(e.at).toISOString()}>
            {new Date(e.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </time>{" "}
          <b>{e.name}</b> {TEXT[e.type]}
        </li>
      ))}
    </ul>
  );
}