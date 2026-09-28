import { PixelArt } from "./pixel/PixelArt";

// Ohm, 16 × 16 pixels. Each letter is a color from pixel/palette.ts, "." is transparent.
// Only the 8 × 4 face on the screen changes. Redraw anything you like: you're the artist.
const FACES = {
  happy: ["kgkkkkgk", "gkgkkgkg", "kkgkkgkk", "pkkggkkp"],
  okay: ["kggkkggk", "kggkkggk", "kkkkkkkk", "kkggggkk"],
  sad: ["kkkkkkkk", "kggkkggk", "kkkggkkk", "kkgkkgkk"],
  off: ["kkkkkkkk", "kcckkcck", "kkkkkkkk", "kkkkkkkk"],
};

export type Face = keyof typeof FACES;

function sprite(face: Face) {
  const rows = [
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
  // Powered off: the blue body and yellow lights fade to grey.
  return face === "off" ? rows.map((row) => row.replace(/[by]/g, "c")) : rows;
}

export function OhmSprite({ face }: { face: Face }) {
  return (
    <PixelArt
      art={sprite(face)}
      title={face === "off" ? "Ohm is powered off" : `Ohm looks ${face}`}
      className="w-48 sm:w-64"
    />
  );
}