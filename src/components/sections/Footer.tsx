import { Fragment } from "react";
import { PRIVACY, REPLY_TEACHER, WEATHER_SOURCE, WORD_LISTS, WORD_PATTERNS } from "@/content/about";

/** Privacy and credits. On phones it sits under the Spellbook; on desktop it's a card of its own. */
export function Footer() {
  return (
    <footer className="space-y-1 text-base text-dim lg:border-[3px] lg:border-line lg:bg-card lg:p-3">
      <p>{PRIVACY}</p>
      <p>
        Weather by{" "}
        <a href={WEATHER_SOURCE.href} className="underline">
          {WEATHER_SOURCE.name}
        </a>
        . Word lists:{" "}
        {WORD_LISTS.map((list, i) => (
          <Fragment key={list.name}>
            {i > 0 && " and "}
            <a href={list.href} className="underline">
              {list.name}
            </a>{" "}
            ({list.license})
          </Fragment>
        ))}
        . Word patterns:{" "}
        <a href={WORD_PATTERNS.href} className="underline">
          {WORD_PATTERNS.name}
        </a>{" "}
        ({WORD_PATTERNS.license}), by{" "}
        <a href={WORD_PATTERNS.credits} className="underline">
          {WORD_PATTERNS.authors} contributors
        </a>
        . His replies: a small network trained on example chats written with{" "}
        <a href={REPLY_TEACHER.href} className="underline">
          {REPLY_TEACHER.name}
        </a>{" "}
        ({REPLY_TEACHER.license}).
      </p>
    </footer>
  );
}
