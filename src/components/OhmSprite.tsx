import type { MilestoneId } from "@/lib/protocol";
import { PixelArt } from "./pixel/PixelArt";

// Ohm, 16 × 16 pixels. Each letter is a color from pixel/palette.ts, "." is transparent.
// Only the 8 × 4 face on the screen changes. Redraw anything you like: you're the artist.
const FACES = {
  happy: ["kgkkkkgk", "gkgkkgkg", "kkgkkgkk", "pkkggkkp"],
  okay: ["kggkkggk", "kggkkggk", "kkkkkkkk", "kkggggkk"],
  sad: ["kkkkkkkk", "kggkkggk", "kkkggkkk", "kkgkkgkk"],
  sleep: ["kkkkkkkk", "kkkkkkkk", "gggkkggg", "kkkkkkkk"],
  off: ["kkkkkkkk", "kcckkcck", "kkkkkkkk", "kkkkkkkk"],
};

export type Face = keyof typeof FACES;

const TITLES: Record<Face, string> = {
  happy: "Ohm looks happy",
  okay: "Ohm looks okay",
  sad: "Ohm looks sad",
  sleep: "Ohm is asleep",
  off: "Ohm is powered off",
};

// Parts Ohm earns with milestones (see MILESTONES in protocol.ts). They're drawn on a 20 × 22
// canvas with Ohm at x 2, y 4, so there's room above for the hat and below for the jetpack flames.
// Drawn in this order: the antenna pokes through the hat. Placeholders: redraw them!
const PARTS: Record<MilestoneId, { x: number; y: number; art: string[] }[]> = {
  hat: [{ x: 4, y: 1, art: ["..kkkkkkkk..", "..kppppppk..", "..kppppppk..", "..kkkkkkkk..", "kkkkkkkkkkkk"] }],
  antenna: [{ x: 9, y: 0, art: ["pp", "pp", "kk", "kk", "kk"] }],
  jetpack: [
    { x: 2, y: 16, art: ["kkk", "kck", "kck", "kkk", ".o.", ".y."] },
    { x: 15, y: 16, art: ["kkk", "kck", "kck", "kkk", ".o.", ".y."] },
  ],
};

function body(face: Face) {
  return [
    ".......yy.......",
    ".......kk.......",
    ".kkkkkkkkkkkkkk.",
    ".kbbbbbbbbbbbbk.",
    ".kbkkkkkkkkkkbk.",
    ...FACES[face].map((row) => `.kbk${row}kbk.`),
    ".kbkkkkkkkkkkbk.",
    ".kbbbbbbbbbbbbk.",
    ".kkkkkkkkkkkkkk.",
    "....kbbbbbbk....",
    "...kbbbyybbbk...",
    "...kbbbbbbbbk...",
    "...kkkkkkkkkk...",
  ];
}

function sprite(face: Face, parts: MilestoneId[]) {
  const canvas = Array.from({ length: 22 }, () => Array<string>(20).fill("."));
  const stamp = (art: string[], x: number, y: number) =>
    art.forEach((row, dy) =>
      [...row].forEach((ch, dx) => {
        if (ch !== ".") canvas[y + dy][x + dx] = ch;
      }),
    );
  stamp(body(face), 2, 4);
  for (const [id, pieces] of Object.entries(PARTS)) {
    if (parts.includes(id as MilestoneId)) for (const p of pieces) stamp(p.art, p.x, p.y);
  }
  const rows = canvas.map((row) => row.join(""));
  // Powered off: the blue body, yellow lights and jetpack flames fade to grey.
  return face === "off" ? rows.map((row) => row.replace(/[byo]/g, "c")) : rows;
}

export function OhmSprite({ face, parts }: { face: Face; parts: MilestoneId[] }) {
  return <PixelArt art={sprite(face, parts)} title={TITLES[face]} className="relative w-60 sm:w-80" />;
}