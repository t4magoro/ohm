"use client";

import { useCallback, useEffect, useState } from "react";
import { pagesOf } from "@/content/thinking";
import type { DeviceButton } from "@/components/pixel/Device";
import type { ChatItem } from "./useOhm";

const PAGE_MS = 1600; // long enough to read one page; any button stops the replay
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * "think": Ohm replays how he built his latest reply on his screen, one page per word, and (!) explains the page.
 * While he thinks, the toy's buttons turn into prev / next / (!) / done, like a real handheld's menu.
 */
export function useThinking(chat: ChatItem[], off: boolean) {
  const latest = chat.findLast((i) => i.from === "ohm");
  const [shown, setShown] = useState<ChatItem | null>(null); // the line Ohm is replaying
  const [page, setPage] = useState(0);
  const [auto, setAuto] = useState(false);
  const [info, setInfo] = useState(false); // (!) is open
  const [infoUsed, setInfoUsed] = useState(false); // (!) glows until you've tried it once
  const [seen, setSeen] = useState(""); // the newest line you've had explained
  const last = shown?.why ? pagesOf(shown.why) - 1 : 0;

  // The replay: one page every PAGE_MS. It pauses while (!) is open, and never runs with reduced motion.
  useEffect(() => {
    if (!shown || !auto || info || page >= last) return;
    const t = setTimeout(() => setPage(page + 1), PAGE_MS);
    return () => clearTimeout(t);
  }, [shown, auto, info, page, last]);

  const closeInfo = useCallback(() => setInfo(false), []);
  const go = (p: number) => {
    setAuto(false);
    setPage(p);
  };
  const replay = () => {
    setPage(0);
    setAuto(!reducedMotion());
  };

  const button: DeviceButton = {
    label: "think",
    mint: true,
    lit: !!latest?.why && seen !== latest.key && !off,
    disabled: off,
    onClick: () => {
      setShown(latest ?? { key: "none", from: "ohm", text: "" }); // nothing said yet: the screen invites you to talk
      setSeen(latest?.key ?? "");
      replay();
    },
  };
  // null while Ohm isn't thinking: then the page shows the care buttons and `button`.
  const buttons: DeviceButton[] | null = shown && [
    { label: "prev", onClick: () => go(page - 1), disabled: page === 0 },
    shown.why && page >= last ? { label: "replay", onClick: replay, disabled: false } : { label: "next", onClick: () => go(page + 1), disabled: !shown.why },
    {
      label: "(!)",
      onClick: () => {
        setInfo(!info);
        setInfoUsed(true);
        setAuto(false);
      },
      disabled: !shown.why,
      pressed: info,
      lit: !!shown.why && !infoUsed,
    },
    {
      label: "done",
      mint: true,
      pressed: true,
      disabled: false,
      onClick: () => {
        setShown(null);
        setInfo(false);
      },
    },
  ];

  return { shown, page, info, closeInfo, button, buttons };
}