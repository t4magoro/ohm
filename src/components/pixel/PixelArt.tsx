import type { CSSProperties } from "react";
import { PALETTE } from "./palette";

type Props = {
  art: string[];
  className?: string;
  style?: CSSProperties;
  /** Set for meaningful images. Leave out for decoration (hidden from screen readers). */
  title?: string;
};

// Turns sprite rows into one SVG path per color.
// Neighbouring pixels of the same color are merged into one rectangle to keep the DOM small.
function toPaths(art: string[]) {
  const paths: Record<string, string> = {};
  art.forEach((row, y) => {
    for (let x = 0; x < row.length; ) {
      const ch = row[x];
      let end = x + 1;
      while (row[end] === ch) end++;
      if (PALETTE[ch]) paths[ch] = (paths[ch] ?? "") + `M${x} ${y}h${end - x}v1h${x - end}z`;
      x = end;
    }
  });
  return paths;
}

// Crisp, scalable pixel art. Size it with a width OR height class, e.g. "w-16" or "h-14 w-auto".
export function PixelArt({ art, className, style, title }: Props) {
  return (
    <svg
      viewBox={`0 0 ${art[0].length} ${art.length}`}
      shapeRendering="crispEdges"
      className={className}
      style={style}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      {Object.entries(toPaths(art)).map(([ch, d]) => (
        <path key={ch} d={d} fill={PALETTE[ch]} />
      ))}
    </svg>
  );
}