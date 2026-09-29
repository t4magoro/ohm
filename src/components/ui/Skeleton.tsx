// Placeholders shown while Ohm connects. They sit exactly where the real parts will appear,
// with the same frames, so nothing jumps when the data arrives.

/** A grey block that pulses softly (and stands still with reduced motion). */
export function Bar({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`block h-4 bg-edge motion-safe:animate-pulse ${className}`} />;
}

/** What Ohm's screen shows before the first message: a terminal booting up. */
export function BootScreen({ text, bad = false }: { text: string; bad?: boolean }) {
  return (
    <div role="status" className="grid size-full place-items-center bg-[#1d2b3a] p-3 text-center">
      <p className={bad ? "text-danger" : "text-mint"}>
        {text}
        <span className="motion-safe:animate-blink">_</span>
      </p>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card space-y-3 p-3">
      <Bar className="w-1/2" />
      <Bar />
      <Bar />
      <div className="grid grid-cols-4 gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <Bar key={i} className="h-10" />
        ))}
      </div>
      <Bar className="w-2/3" />
    </div>
  );
}

export function TermSkeleton({ title }: { title: string }) {
  return (
    <div className="term flex h-full flex-col">
      <div className="term-bar">
        <span>{title}</span>
      </div>
      <div className="space-y-2 p-3">
        {["w-3/4", "w-1/2", "w-2/3"].map((w) => (
          <Bar key={w} className={w} />
        ))}
      </div>
    </div>
  );
}
