import type { Face } from "@/lib/ohmState";
import type { MilestoneId } from "@/lib/protocol";

// Ohm, 24 × 30 pixels: a TV head on a little body with Ω on its chest.
// Each letter is a color from ../palette.ts, "." is transparent. Placeholders: redraw anything you like.

/** The 14 × 6 face on Ohm's screen, one per mood ("." is the dark screen). */
export const FACES: Record<Face, string[]> = {
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

// The screen's sides; the middle 4 rows have bolts sticking out as ears.
const LEFT = [".kbbk", "kkbbk", "kkbbk", "kkbbk", "kkbbk", ".kbbk"];
const RIGHT = ["kbuk.", "kbukk", "kbukk", "kbukk", "kbukk", "kbuk."];

/** Ohm's whole body, with the face for its mood on the screen. */
export function body(face: Face) {
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
// canvas with Ohm at x 2, y 6 (see OhmSprite.tsx), so there's room above for the hat and on the
// sides for the jetpack. Drawn in this order: the antenna pokes through the hat.
export const PARTS: Record<MilestoneId, { x: number; y: number; art: string[] }[]> = {
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
