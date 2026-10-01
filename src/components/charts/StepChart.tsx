import { Axes, DataTable, H, LEFT, PLOT_H, PLOT_W, TOP, W } from "./ChartFrame";
import type { ReactNode } from "react";

/** `null` leaves a gap: not measured. */
export type Series = { name: string; color: string; values: (number | null)[] };

type Props = {
  title: string;
  actions?: ReactNode; // buttons on the right of the title, e.g. a view switch
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
export function StepChart({ title, actions, xs, series, from, to, step, yMax, ticks, fmtX, fmtY }: Props) {
  const px = (x: number) => LEFT + ((x - from) / (to - from)) * PLOT_W;
  const py = (y: number) => TOP + PLOT_H - (Math.min(y, yMax) / yMax) * PLOT_H;
  const path = (values: Series["values"]) =>
    values
      .map((y, i) =>
        y === null ? "" : i > 0 && values[i - 1] !== null && xs[i] - xs[i - 1] <= step * 1.5 ? `H${px(xs[i])}V${py(y)}` : `M${px(xs[i])} ${py(y)}`,
      )
      .join("");
  const show = (y: number | null | undefined) => (y == null ? "-" : fmtY(y));
  const slot = (step / (to - from)) * PLOT_W;
  const readout = (i: number) => series.map((s) => `${s.name} ${show(s.values[i])}`).join(" · ");

  return (
    <figure className="card space-y-2 p-3">
      <div className="flex items-center gap-2">
        <figcaption className="font-pixel text-xs font-bold">{title}</figcaption>
        {actions}
      </div>
      {series.length > 1 && (
        <ul className="flex flex-wrap gap-x-4 text-base">
          {series.map((s) => (
            <li key={s.name} className="flex items-center gap-1">
              <svg width="14" height="4" aria-hidden>
                <line x1="0" x2="14" y1="2" y2="2" stroke={s.color} strokeWidth="2" />
              </svg>
              {s.name} <b>{show(s.values.at(-1))}</b>
            </li>
          ))}
        </ul>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={title}>
        <Axes yMax={yMax} fmtY={fmtY} ticks={ticks.map((t) => ({ at: px(t.x), label: t.label }))} />
        {series.map((s) => (
          <path key={s.name} d={path(s.values)} fill="none" stroke={s.color} strokeWidth={2} shapeRendering="crispEdges" />
        ))}
        {series.map((s) => {
          const last = s.values.at(-1);
          return (
            last != null && (
              <circle
                key={s.name}
                cx={px(xs.at(-1)!)}
                cy={py(last)}
                r={4}
                fill={s.color}
                stroke="var(--background)"
                strokeWidth={2}
              />
            )
          );
        })}
        {xs.map((x, i) => (
          <g key={x} className="group">
            <line x1={px(x)} x2={px(x)} y1={TOP} y2={TOP + PLOT_H} stroke="currentColor" className="opacity-0 group-hover:opacity-40" />
            <rect x={px(x) - slot / 2} y={TOP} width={slot} height={PLOT_H} fill="transparent">
              <title>{`${fmtX(x)}: ${readout(i)}`}</title>
            </rect>
          </g>
        ))}
      </svg>
      <DataTable head={["Time", ...series.map((s) => s.name)]} rows={xs.map((x, i) => [fmtX(x), ...series.map((s) => show(s.values[i]))])} />
    </figure>
  );
}