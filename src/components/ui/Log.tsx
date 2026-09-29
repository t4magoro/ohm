"use client";

import { useRef, useState, type ReactNode } from "react";

/**
 * A terminal log: newest line at the bottom, like `tail -f`. Used by the chat and the feed.
 * - flex-col-reverse starts it scrolled to the bottom and keeps it there as lines arrive, no JavaScript.
 * - No scrollbar; the top edge fades out instead, so you can tell there's more above.
 * - Scroll up and a [newest] button appears to jump back down.
 */
export function Log({ label, children }: { label: string; children: ReactNode }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [scrolledUp, setScrolledUp] = useState(false);

  const toNewest = () => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    scroller.current?.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }); // 0 is the bottom here
  };

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scroller}
        role="log"
        aria-label={label}
        tabIndex={0}
        // With column-reverse, scrollTop is 0 at the bottom and negative above it.
        onScroll={(e) => setScrolledUp(e.currentTarget.scrollTop < -32)}
        className="scroll-quiet fade-top flex h-full flex-col-reverse overflow-y-auto overscroll-contain px-3 py-2 outline-offset-[-3px]"
      >
        <div>{children}</div>
      </div>
      {scrolledUp && (
        <button
          type="button"
          onClick={toNewest}
          className="term-btn absolute bottom-2 right-3 bg-screen motion-safe:animate-rise"
        >
          [newest]
        </button>
      )}
    </div>
  );
}
