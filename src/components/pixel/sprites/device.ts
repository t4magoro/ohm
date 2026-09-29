// The toy's parts (see Device.tsx and Pet.tsx). The egg itself is worked out in Device.tsx.
// Each letter is a color from ../palette.ts, "." is transparent. Placeholders: redraw them!

/** Stars stuck on the egg like stickers: [x, y] of each star's middle, in egg pixels (48 × 52). */
export const EGG_STARS = [[10, 5], [36, 6], [4, 22], [43, 27], [5, 38], [42, 40], [23, 49]];

/** One of the three round buttons under the screen. */
export const BUTTON = ["..kkkk..", ".kyyyyk.", "kywyyyYk", "kyyyyyYk", "kyyyyyYk", "kyyyyYYk", ".kYYYYk.", "..kkkk.."];

/** The tail under Ohm's speech bubble, 3 screen pixels per pixel to match the bubble's border. */
export const BUBBLE_TAIL = ["kwwwwk", ".kwwk.", "..kk.."];
