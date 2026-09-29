// What every chart shares: the drawing size, the axes and the "Show as table" view.
// The charts are small SVGs in the pixel style: square steps and bars, no chart library.
// Hover a column to read its values; "Show as table" lists every number (screen readers, keyboards).

export const W = 320; // the charts scale to their container; these are just the drawing units
export const H = 146;
export const LEFT = 30; // room for the y labels
const RIGHT = 8;
export const TOP = 14; // room for the value on the tallest bar
const BOTTOM = 18; // room for the x labels
export const PLOT_W = W - LEFT - RIGHT;
export const PLOT_H = H - TOP - BOTTOM;

/** Rounds up to an even number, so the middle gridline lands on a whole number. */
export const evenCeil = (v: number) => Math.max(2, Math.ceil(v / 2) * 2);

type Tick = { at: number; label: string }; // `at` in drawing units

export function Axes({ yMax, fmtY, ticks }: { yMax: number; fmtY: (y: number) => string; ticks: Tick[] }) {
  return (
    <g className="fill-current text-[9px] tabular-nums opacity-60">
      {[0, yMax / 2, yMax].map((y) => {
        const top = TOP + PLOT_H - (y / yMax) * PLOT_H;
        return (
          <g key={y}>
            <line x1={LEFT} x2={W - RIGHT} y1={top} y2={top} stroke="currentColor" opacity={0.3} shapeRendering="crispEdges" />
            <text x={LEFT - 4} y={top + 3} textAnchor="end">
              {fmtY(y)}
            </text>
          </g>
        );
      })}
      {ticks.map((t) => (
        <text key={t.at} x={t.at} y={H - 5} textAnchor="middle">
          {t.label}
        </text>
      ))}
    </g>
  );
}

export function DataTable({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <details className="text-base">
      <summary className="cursor-pointer text-dim">Show as table</summary>
      <table className="mt-1 w-full tabular-nums">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} className="text-left font-normal text-dim">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
