import type { ReactNode } from "react";
import { PixelArt } from "./PixelArt";
import { BUTTON, EGG_STARS, THINK_BUTTON } from "./sprites/device";

// The toy Ohm lives in: a Tamagotchi-style egg, 48 × 52 pixels.
// The screen and the four buttons are HTML laid over the drawing, placed in the same pixels.
const W = 48;
const H = 52;

// The egg is worked out, not drawn: a circle stretched taller on top than below, with star stickers.
function shell() {
  const inside = (x: number, y: number) => {
    const dy = y + 0.5 - 28;
    const t = dy / (dy < 0 ? 28 : 24);
    return Math.abs(t) < 1 && Math.abs(x + 0.5 - W / 2) < 23.5 * Math.sqrt(1 - t * t);
  };
  const rows = Array.from({ length: H }, (_, y) =>
    Array.from({ length: W }, (_, x): string => {
      if (!inside(x, y)) return ".";
      if (!inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1)) return "k";
      if (!inside(x - 2, y - 2)) return "l"; // light from the top left
      if (!inside(x + 2, y + 2)) return "V"; // shadow on the bottom right
      return "v";
    }),
  );
  const fill = (x0: number, y0: number, x1: number, y1: number, ch: string) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) rows[y][x] = ch;
  };
  fill(7, 9, 40, 35, "V"); // the bezel around the screen
  fill(8, 10, 39, 34, "k");
  fill(9, 11, 38, 33, "."); // the screen itself is HTML
  for (const [x, y] of EGG_STARS) {
    rows[y][x] = "y";
    rows[y - 1][x] = rows[y + 1][x] = rows[y][x - 1] = rows[y][x + 1] = "Y";
  }
  return rows.map((row) => row.join(""));
}

const SHELL = shell();

/** Where a piece of HTML goes on the drawing, in shell pixels. */
const place = (x: number, y: number, w: number, h: number) => ({
  left: `${(x / W) * 100}%`,
  top: `${(y / H) * 100}%`,
  width: `${(w / W) * 100}%`,
  height: `${(h / H) * 100}%`,
});

/**
 * `glow` blinks on the one button that helps right now (reboot, while Ohm is off). `lit` is a quiet mint glow:
 * something new to look at. `mint` is the think button's color; `pressed` marks a button that's switched on.
 */
export type DeviceButton = {
  label: string;
  onClick: () => void;
  disabled: boolean;
  glow?: boolean;
  lit?: boolean;
  mint?: boolean;
  pressed?: boolean;
};

export function Device({ screen, buttons }: { screen: ReactNode; buttons: DeviceButton[] }) {
  return (
    // A container, so the labels can size themselves to the toy (cqw = 1% of its width).
    <div className="relative w-full [container-type:inline-size]">
      {/* A hard pixel shadow that follows the egg's outline. */}
      <PixelArt art={SHELL} className="block w-full drop-shadow-[6px_6px_0_var(--shadow)]" />
      <div className="absolute overflow-hidden" style={place(9, 11, 30, 23)}>
        {screen}
      </div>
      {buttons.map((b, i) => (
        <button
          key={i} // by place, not label: the labels change while Ohm shows his thinking
          type="button"
          onClick={b.onClick}
          disabled={b.disabled}
          aria-pressed={b.pressed}
          className="group absolute flex flex-col items-center gap-1 disabled:opacity-35"
          style={place(7 + i * 8.5, 36, 8.5, 11)}
        >
          {/* Sinks one pixel the moment it's pressed, like a real button. */}
          <PixelArt
            art={b.mint ? THINK_BUTTON : BUTTON}
            className={`w-[82%] group-active:translate-y-[12.5%] ${b.glow ? "drop-shadow-[0_0_5px_#fff]" : b.lit ? "drop-shadow-[0_0_4px_var(--color-mint)]" : ""}`}
          />
          <span className={`font-pixel text-[clamp(10px,3.2cqw,12px)] font-bold leading-none text-ink ${b.glow ? "motion-safe:animate-blink" : ""}`}>
            {b.label}
          </span>
        </button>
      ))}
    </div>
  );
}