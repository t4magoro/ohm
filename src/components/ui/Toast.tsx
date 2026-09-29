/**
 * Messages from Ohm ("Slow down…", "Thanks! The report was sent…"). They float above everything;
 * on phones just above the tab bar. The status role is always there, so screen readers hear each one.
 */
export function Toast({ toast }: { toast: { text: string; bad: boolean } | null }) {
  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(3.5rem+3px+env(safe-area-inset-bottom)+0.75rem)] z-20 flex justify-center px-4 lg:bottom-6"
    >
      {toast && (
        <p
          key={toast.text}
          className={`term px-3 py-1 motion-safe:animate-rise motion-reduce:animate-fade ${toast.bad ? "text-danger" : "text-mint"}`}
        >
          &gt; {toast.text}
        </p>
      )}
    </div>
  );
}
