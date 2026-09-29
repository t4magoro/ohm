// What each live feed event says, and its color (a Tailwind text class).
import { MILESTONES, type FeedEvent } from "@/lib/protocol";

const TEXT: Record<Exclude<FeedEvent["type"], "taught" | "unlocked">, [string, string]> = {
  charge: ["charged Ohm", "text-lemon"],
  play: ["played with Ohm", "text-pink"],
  reboot: ["rebooted Ohm", "text-lilac"],
  shutdown: ["shut down: its battery ran out", "text-danger"],
};

export function describe(e: FeedEvent): [string, string] {
  if (e.type === "taught") return [`taught Ohm "${e.detail}"`, "text-mint"];
  if (e.type === "unlocked") return [`unlocked ${MILESTONES.find((m) => m.id === e.detail)?.part ?? "a new part"}!`, "text-lemon"];
  return TEXT[e.type];
}

export const EMPTY_FEED = "# nothing yet. be the first to charge Ohm!";
