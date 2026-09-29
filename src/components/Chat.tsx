"use client";

import { useState } from "react";
import { cleanName, MAX_SAY } from "@/lib/protocol";
import type { ChatItem } from "@/lib/useOhm";
import { Log } from "./Log";

const NOTE =
  "# Ohm learns words from what you type. Nobody else sees your message, but Ohm can reuse its words in answers everyone sees, so don't type anything personal.";

type Props = {
  items: ChatItem[];
  disabled: boolean;
  name: string;
  onSay: (text: string) => void;
  onReport: (lineId: number) => void;
  onRename: (name: string) => void;
};

/** Talking to Ohm, as a terminal: your name on top, the conversation, then `$` and your message. */
export function Chat({ items, disabled, name, onSay, onReport, onRename }: Props) {
  const [text, setText] = useState("");
  const [draft, setDraft] = useState<string | null>(null); // the name being typed, null when not editing
  const draftOk = draft !== null && cleanName(draft) !== null;

  return (
    <section className="term flex h-full flex-col">
      <h2 className="term-bar">
        <span>talk to ohm</span>
      </h2>

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
        {draft !== null && !draftOk && <p className="text-danger">! 2-16 letters, numbers, spaces, - or _</p>}
      </form>

      <Log label="Chat with Ohm">
        {items.length === 0 && <p className="text-dim"># no messages yet. say hi below, Ohm answers here.</p>}
        <ul>
          {items.map((item) =>
            item.from === "you" ? (
              <li key={item.key}>
                <span className="text-pink">$</span> {item.text}
              </li>
            ) : (
              <li key={item.key}>
                <span className="text-mint">ohm&gt;</span> {item.text} <span className="text-dim">@{item.to}</span>{" "}
                <button
                  type="button"
                  className="term-btn text-base text-dim hover:text-screen focus-visible:text-screen"
                  aria-label="Report this line"
                  title="Report this line"
                  onClick={() => onReport(item.lineId!)}
                >
                  [report]
                </button>
              </li>
            ),
          )}
        </ul>
      </Log>

      {/* Pinned above the prompt, outside the log, so it never scrolls away: you read it right where you type.
          Desktop has room for the whole note. Phones get a one-line [readme] that opens on tap (a native
          <details>), so the chat keeps its space. */}
      <div className="border-t-2 border-edge px-3 pt-1.5 text-base leading-snug text-dim">
        <p id="chat-note" className="max-lg:hidden">
          {NOTE}
        </p>
        <details className="group lg:hidden">
          <summary className="cursor-pointer list-none text-lemon [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">[+] readme</span>
            <span className="hidden group-open:inline">[-] readme</span>
            <span className="text-dim group-open:hidden"> before you type</span>
          </summary>
          <p className="mt-1">{NOTE}</p>
        </details>
      </div>
      <form
        className="flex items-center gap-2 px-3 pb-2 pt-1"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          onSay(text.trim());
          setText("");
        }}
      >
        <span className="text-pink" aria-hidden>
          $
        </span>
        <input
          aria-label="Your message to Ohm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_SAY}
          placeholder={disabled ? "ohm is off" : "say something..."}
          disabled={disabled}
          enterKeyHint="send"
          aria-describedby="chat-note" // screen readers read the note when you focus the box
          className="term-input"
        />
        <button type="submit" disabled={disabled || !text.trim()} className="term-btn">
          [send]
        </button>
      </form>
    </section>
  );
}
