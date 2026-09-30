"use client";

import { useState } from "react";
import { CHAT_NOTE, EMPTY_CHAT } from "@/content/chat";
import type { ChatItem } from "@/hooks/useOhm";
import { MAX_SAY } from "@/lib/protocol";
import { Log } from "../ui/Log";
import { WhoAmI } from "./WhoAmI";

type Props = {
  items: ChatItem[];
  disabled: boolean;
  wait : number,
  name: string;
  onSay: (text: string) => void;
  onReport: (lineId: number) => void;
  onRename: (name: string) => void;
};

/** Talking to Ohm, as a terminal: your name on top, the conversation, then `$` and your message. */
export function Chat({ items, disabled, wait, name, onSay, onReport, onRename }: Props) {
  const [text, setText] = useState("");

  return (
    <section className="term flex h-full flex-col">
      <h2 className="term-bar">
        <span>talk to ohm</span>
      </h2>

      <WhoAmI name={name} onRename={onRename} />

      <Log label="Chat with Ohm">
        {items.length === 0 && <p className="text-dim">{EMPTY_CHAT}</p>}
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
          {CHAT_NOTE}
        </p>
        <details className="group lg:hidden">
          <summary className="cursor-pointer list-none text-lemon [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">[+] readme</span>
            <span className="hidden group-open:inline">[-] readme</span>
            <span className="text-dim group-open:hidden"> before you type</span>
          </summary>
          <p className="mt-1">{CHAT_NOTE}</p>
        </details>
      </div>
      <form
        className="flex items-center gap-2 px-3 pb-2 pt-1"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim() || wait) return; // keep the text: it can go out when the wait is over
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
        <button
          type="submit"
          disabled={disabled || !text.trim() || wait > 0}
          // Keeps the focus (and the phone's keyboard) in the text box when you tap [send].
          onPointerDown={(e) => e.preventDefault()}
          className="term-btn"
        >
          {wait ? `[wait ${wait}s]` : "[send]"}
        </button>
      </form>
    </section>
  );
}
