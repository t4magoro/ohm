// Small SVG charts in the pixel style: square steps and bars, no chart library.
// Hover a column to read its values; "Show as table" lists every number (screen readers, keyboards).
import { PALETTE } from "./pixel/palette";

const W = 320; // the charts scale to their container; these are just the drawing units
const H = 146;
const LEFT = 30; // room for the y labels
const RIGHT = 8;
const TOP = 14; // room for the value on the tallest bar
const BOTTOM = 18; // room for the x labels
const PLOT_W = W - LEFT - RIGHT;
const PLOT_H = H - TOP - BOTTOM;

/** Rounds up to an even number, so the middle gridline lands on a whole number. */
export const evenCeil = (v: number) => Math.max(2, Math.ceil(v / 2) * 2);

type Tick = { at: number; label: string }; // `at` in drawing units

function Axes({ yMax, fmtY, ticks }: { yMax: number; fmtY: (y: number) => string; ticks: Tick[] }) {
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

function DataTable({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <details className="text-xs">
      <summary className="cursor-pointer opacity-70">Show as table</summary>
      <table className="mt-1 w-full tabular-nums">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} className="text-left font-normal opacity-70">
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

export type Series = { name: string; color: string; values: number[] };

type StepProps = {
  title: string;
  xs: number[]; // shared by every series: one value per x
  series: Series[];
  from: number;
  to: number;
  step: number; // the normal distance between two xs; a bigger gap means missing data, so the line breaks
  yMax: number;
  ticks: { x: number; label: string }[];
  fmtX: (x: number) => string;
  fmtY: (y: number) => string;
};

/** A line over time that holds each value until the next one, like a pixel staircase. */
export function StepChart({ title, xs, series, from, to, step, yMax, ticks, fmtX, fmtY }: StepProps) {
  const px = (x: number) => LEFT + ((x - from) / (to - from)) * PLOT_W;
  const py = (y: number) => TOP + PLOT_H - (Math.min(y, yMax) / yMax) * PLOT_H;
  const path = (values: number[]) =>
    values
      .map((y, i) => (i > 0 && xs[i] - xs[i - 1] <= step * 1.5 ? `H${px(xs[i])}V${py(y)}` : `M${px(xs[i])} ${py(y)}`))
      .join("");
  const slot = (step / (to - from)) * PLOT_W;
  const readout = (i: number) => series.map((s) => `${s.name} ${fmtY(s.values[i])}`).join(" · ");

  return (
    <figure className="space-y-1">
      <figcaption className="text-sm font-bold">{title}</figcaption>
      {series.length > 1 && (
        <ul className="flex gap-4 text-xs">
          {series.map((s) => (
            <li key={s.name} className="flex items-center gap-1">
              <svg width="14" height="4" aria-hidden>
                <line x1="0" x2="14" y1="2" y2="2" stroke={s.color} strokeWidth="2" />
              </svg>
              {s.name} {s.values.length > 0 && <b>{fmtY(s.values.at(-1)!)}</b>}
            </li>
          ))}
        </ul>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={title}>
        <Axes yMax={yMax} fmtY={fmtY} ticks={ticks.map((t) => ({ at: px(t.x), label: t.label }))} />
        {series.map((s) => (
          <path key={s.name} d={path(s.values)} fill="none" stroke={s.color} strokeWidth={2} shapeRendering="crispEdges" />
        ))}
        {series.map(
          (s) =>
            s.values.length > 0 && (
              <circle
                key={s.name}
                cx={px(xs.at(-1)!)}
                cy={py(s.values.at(-1)!)}
                r={4}
                fill={s.color}
                stroke="var(--background)"
                strokeWidth={2}
              />
            ),
        )}
        {xs.map((x, i) => (
          <g key={x} className="group">
            <line x1={px(x)} x2={px(x)} y1={TOP} y2={TOP + PLOT_H} stroke="currentColor" className="opacity-0 group-hover:opacity-40" />
            <rect x={px(x) - slot / 2} y={TOP} width={slot} height={PLOT_H} fill="transparent">
              <title>{`${fmtX(x)}: ${readout(i)}`}</title>
            </rect>
          </g>
        ))}
      </svg>
      <DataTable head={["Time", ...series.map((s) => s.name)]} rows={xs.map((x, i) => [fmtX(x), ...series.map((s) => fmtY(s.values[i]))])} />
    </figure>
  );
}

type BarProps = {
  title: string;
  bars: { label: string; value: number }[];
  fmt: (v: number) => string;
};

/** Columns from one baseline, in the first chart color. The tallest one carries its value. */
export function BarChart({ title, bars, fmt }: BarProps) {
  const yMax = evenCeil(Math.max(...bars.map((b) => b.value)));
  const slot = PLOT_W / bars.length;
  const width = Math.min(24, slot - 2); // 2 units of air between neighbours
  const top = bars.reduce((best, b, i) => (b.value > bars[best].value ? i : best), 0);
  const height = (v: number) => (v / yMax) * PLOT_H;
  const labelEvery = Math.ceil(bars.length / 8); // at most 8 x labels, so they never overlap
  const ticks = bars.flatMap((b, i) => (i % labelEvery === 0 ? [{ at: LEFT + slot * (i + 0.5), label: b.label }] : []));

  return (
    <figure className="space-y-1">
      <figcaption className="text-sm font-bold">{title}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={title}>
        <Axes yMax={yMax} fmtY={fmt} ticks={ticks} />
        {bars.map((b, i) => (
          <g key={b.label}>
            <rect
              x={LEFT + slot * i + (slot - width) / 2}
              y={TOP + PLOT_H - height(b.value)}
              width={width}
              height={height(b.value)}
              fill={PALETTE.u}
              shapeRendering="crispEdges"
            />
            <rect x={LEFT + slot * i} y={TOP} width={slot} height={PLOT_H} fill="transparent" className="hover:fill-current hover:opacity-10">
              <title>{`${b.label}: ${fmt(b.value)}`}</title>
            </rect>
          </g>
        ))}
        {bars[top].value > 0 && (
          <text
            x={LEFT + slot * (top + 0.5)}
            y={TOP + PLOT_H - height(bars[top].value) - 3}
            textAnchor="middle"
            className="fill-current text-[9px] tabular-nums"
          >
            {fmt(bars[top].value)}
          </text>
        )}
      </svg>
      <DataTable head={["", "Value"]} rows={bars.map((b) => [b.label, fmt(b.value)])} />
    </figure>
  );
}