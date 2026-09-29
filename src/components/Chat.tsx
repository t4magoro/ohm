"use client";

import { useState } from "react";
import { MAX_SAY } from "@/lib/protocol";
import type { ChatItem } from "@/lib/useOhm";

type Props = { items: ChatItem[]; disabled: boolean; onSay: (text: string) => void; onReport: (lineId: number) => void };

export function Chat({ items, disabled, onSay, onReport }: Props) {
  const [text, setText] = useState("");

  return (
    <section className="space-y-2">
      <h2 className="font-bold">Talk to Ohm</h2>
      <p className="text-xs opacity-70">
        Ohm learns words from what you type. Nobody else sees your message, but Ohm can reuse its words in answers
        everyone sees, so don&apos;t type anything personal.
      </p>
      {items.length > 0 && (
        <ul className="space-y-1 text-sm">
          {items.map((item) =>
            item.from === "you" ? (
              <li key={item.key} className="text-right opacity-70">
                You: {item.text}
              </li>
            ) : (
              <li key={item.key}>
                🤖 <b>Ohm</b> → {item.to}: {item.text}{" "}
                <button
                  type="button"
                  className="opacity-50 hover:opacity-100"
                  aria-label="Report this line"
                  title="Report this line"
                  onClick={() => onReport(item.lineId!)}
                >
                  🚩
                </button>
              </li>
            ),
          )}
        </ul>
      )}
      <form
        className="flex gap-2 text-sm"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          onSay(text.trim());
          setText("");
        }}
      >
        <input
          aria-label="Your message to Ohm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_SAY}
          placeholder={disabled ? "Ohm is off" : "Say something…"}
          disabled={disabled}
          className="min-w-0 flex-1 rounded border-2 border-current bg-transparent px-2 py-1"
        />
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          className="rounded border-2 border-current px-4 py-1 font-bold disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </section>
  );
}