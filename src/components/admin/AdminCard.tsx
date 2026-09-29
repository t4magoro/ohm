import type { ReactNode } from "react";

// The frames every admin list uses: a card with a title and count, a list, and one row.

export function AdminCard({ id, title, count, children }: { id: string; title: string; count?: number; children: ReactNode }) {
  return (
    <section id={id} className="card scroll-mt-24 p-3">
      <h2 className="mb-2 font-pixel text-sm font-bold">
        {title} {count !== undefined && <span className="text-lemon">({count})</span>}
      </h2>
      {children}
    </section>
  );
}

/** The rows, or a friendly line when there are none. */
export function List({ empty, children }: { empty: string; children: ReactNode[] }) {
  return children.length === 0 ? <p className="text-dim">{empty}</p> : <ul className="divide-y-2 divide-edge">{children}</ul>;
}

/** One line of a list: the word, grey details, and its actions on the right. */
export function Row({ word, meta, children }: { word: ReactNode; meta?: ReactNode; children: ReactNode }) {
  return (
    <li className="flex flex-wrap items-baseline gap-x-3 py-1.5">
      <span className="text-lemon">{word}</span>
      {meta && <span className="text-dim">{meta}</span>}
      <span className="ml-auto flex flex-wrap gap-1">{children}</span>
    </li>
  );
}
