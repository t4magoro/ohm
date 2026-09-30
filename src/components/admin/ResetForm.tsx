"use client";

import { useState } from "react";

const WORD = "RESET"; // the API refuses a reset without it (see parseAdminCommand in ohm-api)
const input = "w-28 border-2 border-edge bg-screen px-1 text-lg outline-none caret-pink focus:border-danger";

/** Wipes what Ohm learned, once you type RESET. It can't be undone. */
export function ResetForm({ busy, onReset }: { busy: boolean; onReset: () => Promise<boolean> }) {
  const [typed, setTyped] = useState("");
  return (
    <>
      <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
        <p>
          <span className="text-danger">forgets:</span> every word, the approval queue, word patterns, situations and
          links, the four skills
        </p>
        <p>
          <span className="text-mint">keeps:</span> the blocklist, bans, reports, Ohm&apos;s past lines, the feed, the
          Vitals history, unlocked milestones
        </p>
      </div>
      <form
        className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (await onReset()) setTyped("");
        }}
      >
        <label className="flex items-center gap-2">
          type {WORD} to confirm
          <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={WORD} autoComplete="off" spellCheck={false} className={input} />
        </label>
        <button className="btn bg-danger" disabled={busy || typed !== WORD}>
          reset brain
        </button>
      </form>
      <p className="mt-2 text-dim">It can&apos;t be undone. Every open page&apos;s Spellbook drops to zero right away.</p>
    </>
  );
}