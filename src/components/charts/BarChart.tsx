import { PALETTE } from "../pixel/palette";
import { Axes, DataTable, evenCeil, H, LEFT, PLOT_H, PLOT_W, TOP, W } from "./ChartFrame";

type Props = {
  title: string;
  bars: { label: string; value: number }[];
  fmt: (v: number) => string;
};

/** Columns from one baseline, in the first chart color. The tallest one carries its value. */
export function BarChart({ title, bars, fmt }: Props) {
  const yMax = evenCeil(Math.max(...bars.map((b) => b.value)));
  const slot = PLOT_W / bars.length;
  const width = Math.min(24, slot - 2); // 2 units of air between neighbours
  const top = bars.reduce((best, b, i) => (b.value > bars[best].value ? i : best), 0);
  const height = (v: number) => (v / yMax) * PLOT_H;
  const labelEvery = Math.ceil(bars.length / 8); // at most 8 x labels, so they never overlap
  const ticks = bars.flatMap((b, i) => (i % labelEvery === 0 ? [{ at: LEFT + slot * (i + 0.5), label: b.label }] : []));

  return (
    <figure className="card space-y-2 p-3">
      <figcaption className="font-pixel text-xs font-bold">{title}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={title}>
        <Axes yMax={yMax} fmtY={fmt} ticks={ticks} />
        {bars.map((b, i) => (
          <g key={b.label}>
            <rect
              x={LEFT + slot * i + (slot - width) / 2}
              y={TOP + PLOT_H - height(b.value)}
              width={width}
              height={height(b.value)}
              fill={PALETTE.a}
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
