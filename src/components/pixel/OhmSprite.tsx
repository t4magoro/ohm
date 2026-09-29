import type { Face } from "@/lib/ohmState";
import type { MilestoneId } from "@/lib/protocol";
import { PixelArt } from "./PixelArt";
import { body, PARTS } from "./sprites/ohm";

const TITLES: Record<Face, string> = {
  happy: "Ohm looks happy",
  okay: "Ohm looks okay",
  sad: "Ohm looks sad",
  sleep: "Ohm is asleep",
  off: "Ohm is powered off",
};

// How fast Ohm bobs up and down: a happy robot bounces, a sad one barely moves.
const BOB_SECONDS: Record<Face, number | null> = { happy: 0.6, okay: 1, sad: 1.6, sleep: 2.4, off: null };

/** Ohm on a 28 × 38 canvas at x 2, y 6, with the parts it has earned stamped on top. */
function sprite(face: Face, parts: MilestoneId[]) {
  const canvas = Array.from({ length: 38 }, () => Array<string>(28).fill("."));
  const stamp = (art: string[], x: number, y: number) =>
    art.forEach((row, dy) =>
      [...row].forEach((ch, dx) => {
        if (ch !== ".") canvas[y + dy][x + dx] = ch;
      }),
    );
  stamp(body(face), 2, 6);
  for (const [id, pieces] of Object.entries(PARTS)) {
    if (parts.includes(id as MilestoneId)) for (const p of pieces) stamp(p.art, p.x, p.y);
  }
  const rows = canvas.map((row) => row.join(""));
  // Powered off: the blue body, cheeks and lights fade to grey.
  return face === "off" ? rows.map((row) => row.replace(/[bry]/g, "c").replace(/[uo]/g, "z")) : rows;
}

export function OhmSprite({ face, parts, className }: { face: Face; parts: MilestoneId[]; className?: string }) {
  const bob = BOB_SECONDS[face];
  return (
    <PixelArt
      art={sprite(face, parts)}
      title={TITLES[face]}
      className={`${className} ${bob ? "motion-safe:animate-bob" : ""}`}
      style={bob ? { animationDuration: `${bob}s` } : undefined}
    />
  );
}
