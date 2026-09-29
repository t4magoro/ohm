"use client";

import { useState } from "react";
import { MAX_SAY } from "@/lib/protocol";
import type { ChatItem } from "@/lib/useOhm";

type Props = { items: ChatItem[]; disabled: boolean; onSay: (text: string) => void; onReport: (lineId: number) => void };

/** Talking to Ohm, as a terminal: you type after the $, Ohm answers after ohm>. */
export function Chat({ items, disabled, onSay, onReport }: Props) {
  const [text, setText] = useState("");

  return (
    <section className="term">
      <h2 className="term-bar">
        <span>talk to ohm</span>
      </h2>
      <div className="space-y-2 px-3 py-2">
        <p className="text-dim">
          # Ohm learns words from what you type. Nobody else sees your message, but Ohm can reuse its words in answers
          everyone sees, so don&apos;t type anything personal.
        </p>
        {items.length > 0 && (
          // column-reverse keeps the scroll pinned to the newest line, no JavaScript needed.
          <div className="flex max-h-64 flex-col-reverse overflow-y-auto">
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
          </div>
        )}
        <form
          className="flex items-center gap-2"
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
            className="term-input"
          />
          <button type="submit" disabled={disabled || !text.trim()} className="term-btn">
            [send]
          </button>
        </form>
      </div>
    </section>
  );
}
