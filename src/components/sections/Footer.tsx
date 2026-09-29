import { Fragment } from "react";
import { PRIVACY, WEATHER_SOURCE, WORD_LISTS } from "@/content/about";

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
        .
      </p>
    </footer>
  );
}
