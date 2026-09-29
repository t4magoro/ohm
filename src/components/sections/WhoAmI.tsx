"use client";

import { useState } from "react";
import { NAME_RULE } from "@/content/chat";
import { cleanName } from "@/lib/protocol";

/** The top line of the chat terminal: your name, which you can change. */
export function WhoAmI({ name, onRename }: { name: string; onRename: (name: string) => void }) {
  const [draft, setDraft] = useState<string | null>(null); // the name being typed, null when not editing
  const draftOk = draft !== null && cleanName(draft) !== null;

  return (
    <form
      className="border-b-2 border-edge px-3 py-1"
      onSubmit={(e) => {
        e.preventDefault();
        const clean = cleanName(draft ?? "");
        if (!clean) return;
        onRename(clean);
        setDraft(null);
      }}
    >
      <div className="flex items-center gap-2">
        <label htmlFor="name" className="text-dim">
          whoami:
        </label>
        <input
          id="name"
          value={draft ?? name}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={16}
          autoComplete="nickname"
          className="term-input"
        />
        <button type="submit" className="term-btn" disabled={!draftOk}>
          [save]
        </button>
      </div>
      {draft !== null && !draftOk && <p className="text-danger">{NAME_RULE}</p>}
    </form>
  );
}
