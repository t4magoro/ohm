import { odds } from "@/lib/format";

/** A chance as dots you can count: "2 in 5" is 5 dots, 2 of them filled. In the text's color, sized to it. */
export function Dots({ p }: { p: number }) {
  const { n, d } = odds(p);
  return (
    <span aria-hidden className="inline-flex shrink-0 gap-[0.15em] align-middle">
      {Array.from({ length: d }, (_, i) => (
        <span key={i} className={`size-[0.4em] bg-current ${i < n ? "" : "opacity-25"}`} />
      ))}
    </span>
  );
}