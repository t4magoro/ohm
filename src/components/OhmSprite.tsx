import type { MilestoneId } from "@/lib/protocol";
import { PixelArt } from "./pixel/PixelArt";

// Ohm, 24 × 30 pixels: a TV head on a little body with Ω on its chest.
// Each letter is a color from pixel/palette.ts, "." is transparent.
// Only the 14 × 6 face on the screen changes ("." is the dark screen). Redraw anything you like.
const FACES = {
  happy: [
    "..............",
    "..aaa....aaa..",
    ".a...a..a...a.",
    "..............",
    ".....a..a.....",
    "......aa......",
  ],
  okay: [
    "..............",
    "...aa....aa...",
    "...aa....aa...",
    "..............",
    ".....aaaa.....",
    "..............",
  ],
  sad: [
    "..............",
    "....a....a....",
    "..aa......aa..",
    "..b...........",
    ".....aaaa.....",
    "....a....a....",
  ],
  sleep: [
    "..............",
    "..............",
    "..aaa....aaa..",
    "..............",
    "......aa......",
    "..............",
  ],
  off: [
    "..............",
    "..............",
    "..............",
    "..............",
    "..............",
    "..............",
  ],
};

export type Face = keyof typeof FACES;

const TITLES: Record<Face, string> = {
  happy: "Ohm looks happy",
  okay: "Ohm looks okay",
  sad: "Ohm looks sad",
  sleep: "Ohm is asleep",
  off: "Ohm is powered off",
};

// How fast Ohm bobs up and down: a happy robot bounces, a sad one barely moves.
const BOB_SECONDS: Record<Face, number | null> = { happy: 0.6, okay: 1, sad: 1.6, sleep: 2.4, off: null };

// The screen's sides; the middle 4 rows have bolts sticking out as ears.
const LEFT = [".kbbk", "kkbbk", "kkbbk", "kkbbk", "kkbbk", ".kbbk"];
const RIGHT = ["kbuk.", "kbukk", "kbukk", "kbukk", "kbukk", "kbuk."];

function body(face: Face) {
  return [
    "...........kk...........",
    "..........kywk..........",
    "..........kyyk..........",
    "...........kk...........",
    "...........kk...........",
    "...kkkkkkkkkkkkkkkkkk...",
    "..kwwbbbbbbbbbbbbbbbbk..",
    ".kwbbbbbbbbbbbbbbbbbbuk.",
    ".kwbkkkkkkkkkkkkkkkkbuk.",
    ...FACES[face].map((row, i) => LEFT[i] + row.replaceAll(".", "e") + RIGHT[i]),
    ".kbbkkkkkkkkkkkkkkkkbuk.",
    ".kbrrbbbbbbbbbbbbbbrruk.",
    ".kbbbbbbbbbbbbbbbbbbbuk.",
    "..kuuuuuuuuuuuuuuuuuuk..",
    "...kkkkkkkkkkkkkkkkkk...",
    "......kwbbbbbbbbuk......",
    "...kkkkbbbyyyybbukkkk...",
    "...kbbkbbybbbbybukbuk...",
    "...kbbkbbybbbbybukbuk...",
    "...kkkkbbbybbybbukkkk...",
    "......kbbyybbyybuk......",
    "......kuuuuuuuuuuk......",
    "......kkkkkkkkkkkk......",
    ".......kbbk..kbbk.......",
    ".......kkkk..kkkk.......",
  ];
}

// Parts Ohm earns with milestones (see MILESTONES in protocol.ts). They're drawn on a 28 × 38
// canvas with Ohm at x 2, y 6, so there's room above for the hat and on the sides for the jetpack.
// Drawn in this order: the antenna pokes through the hat.
const PARTS: Record<MilestoneId, { x: number; y: number; art: string[] }[]> = {
  hat: [
    {
      x: 6,
      y: 4,
      art: [
        "...kkkkkkkkkk...",
        "...kweeeeeeek...",
        "...keeeeeeeek...",
        "...kppppppppk...",
        "...keeeeeeeek...",
        "kkkkkkkkkkkkkkkk",
        ".keeeeeeeeeeeek.",
      ],
    },
  ],
  antenna: [{ x: 12, y: 0, art: [".kk.", "kpwk", "kppk", ".kk.", ".kk.", ".kk.", ".kk.", ".kk.", ".kk.", ".kk.", ".kk."] }],
  jetpack: [
    { x: 0, y: 25, art: [".kk.", "kcck", "kcwk", "kcck", "kcck", "kkkk", ".oo.", ".yy.", "..y."] },
    { x: 24, y: 25, art: [".kk.", "kcck", "kcwk", "kcck", "kcck", "kkkk", ".oo.", ".yy.", ".y.."] },
  ],
};

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
