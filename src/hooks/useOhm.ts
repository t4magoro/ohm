"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BANNED,
  CARE_GAP_MS,
  SAY_GAP_MS,
  type Brain,
  type ClientMsg,
  type FeedEvent,
  type Line,
  type MilestoneId,
  type Pet,
  type ServerMsg,
  type Weather,
  type Why,
} from "@/lib/protocol";

const WS_URL = `${(process.env.NEXT_PUBLIC_API_URL ?? "").replace(/^http/, "ws")}/ws`;
const FEED_SIZE = 30;
const CHAT_SIZE = 30;

/** One line in the chat box: yours (only you see it) or Ohm's (everyone sees it). `why`: only on lines said live. */
export type ChatItem = { key: string; from: "you" | "ohm"; text: string; to?: string; lineId?: number; why?: Why };
/** "While you were away": what happened since your last visit. */
export type Away = Extract<ServerMsg, { t: "away" }>;

/** The newest charge or play Ohm reacts to: yours the moment you press, others' when the server tells us. */
export type Poke = { key: string; type: "charge" | "play" | "pat"; at: number };
// Your ratings, remembered per browser so the buttons stay hidden after a reload. The server is the source of truth.
const RATED_KEY = "ohm-rated";
function savedVotes(): Record<number, boolean> {
  try {
    return JSON.parse(localStorage.getItem(RATED_KEY) ?? "{}");
  } catch {
    return {};
  }
}

const ohmSaid = (l: Line, why?: Why): ChatItem => ({ key: `ohm-${l.id}`, from: "ohm", text: l.text, to: l.to, lineId: l.id, why });

// localStorage can throw (private mode, blocked storage), so every access is guarded.
function remembered(key: string, make: () => string): string {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return saved;
    const fresh = make();
    localStorage.setItem(key, fresh);
    return fresh;
  } catch {
    return make();
  }
}

// crypto.randomUUID only exists on https and localhost, so fall back anywhere else.
const randomId = () =>
  crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
const guestName = () => `Guest-${Math.floor(1000 + Math.random() * 9000)}`;

/** The live connection to Ohm. Everything browser-only happens inside effects and callbacks. */
export function useOhm() {
  const [pet, setPet] = useState<Pet | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [brain, setBrain] = useState<Brain | null>(null);
  const [unlocked, setUnlocked] = useState<MilestoneId[]>([]);
  const [away, setAway] = useState<Away | "first" | null>(null); // "first": no visit on record yet
  const [online, setOnline] = useState(0);
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [chat, setChat] = useState<ChatItem[]>([]);
  const [connected, setConnected] = useState(false);
  const [banned, setBanned] = useState(false);
  const [toast, setToast] = useState<{ text: string; bad: boolean } | null>(null);
  const [name, setName] = useState("");
  const [deviceNow, setDeviceNow] = useState(0);
  const [poke, setPoke] = useState<Poke | null>(null);
  const [votes, setVotes] = useState<Record<number, boolean>>({}); // your pats and frowns, by line id
  const [loaded, setLoaded] = useState({ chat: 0, feed: 0 }); // the newest line that came with the history
  const [careUntil, setCareUntil] = useState(0); // device time when charge, play and reboot work again
  const [sayUntil, setSayUntil] = useState(0); // device time when you may chat again
  const [offset, setOffset] = useState(0); // server clock − this device's clock
  const ws = useRef<WebSocket | null>(null);
  const me = useRef({ id: "", name: "" });

  // Connect, and reconnect after a drop: 1 s, 2 s, 4 s … up to 30 s. Every deploy drops all connections.
  useEffect(() => {
    me.current = { id: remembered("ohm-id", randomId), name: remembered("ohm-name", guestName) };
    let lastSeen = 0; // your last visit: sent with the first hello only, so reconnects don't repeat the summary
    try {
      lastSeen = Number(localStorage.getItem("ohm-last-seen")) || 0;
    } catch {
      // storage blocked: no "while you were away"
    }
    let firstVisit = !lastSeen; // the banner says what Ohm is instead, once
    let retry = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    const connect = () => {
      const socket = new WebSocket(WS_URL);
      ws.current = socket;
      socket.onopen = () => {
        retry = 0;
        setConnected(true);
        setName(me.current.name);
        setVotes(savedVotes());
        socket.send(JSON.stringify({ t: "hello", ...me.current, ...(lastSeen ? { lastSeen } : {}) } satisfies ClientMsg));
        lastSeen = 0;
        if (firstVisit) setAway("first");
        firstVisit = false;
      };
      socket.onmessage = (ev) => {
        const msg = JSON.parse(ev.data as string) as ServerMsg;
        if (msg.t === "state") {
          setPet(msg.pet);
          setWeather(msg.weather);
          setBrain(msg.brain);
          setUnlocked(msg.unlocked);
          setOffset(msg.now - Date.now());
        } else if (msg.t === "away") setAway(msg);
        else if (msg.t === "online") setOnline(msg.online);
        else if (msg.t === "feed") {
          setFeed(msg.events);
          setLoaded((l) => ({ ...l, feed: msg.events[0]?.id ?? 0 }));
        } else if (msg.t === "event") {
          setFeed((f) => [msg.e, ...f].slice(0, FEED_SIZE));
          const e = msg.e;
          // Your own charge made Ohm react when you pressed, so the server's echo of it is skipped.
          // ponytail: matched by name, so someone with your exact name won't make Ohm hop for you.
          if ((e.type === "charge" || e.type === "play") && e.name !== me.current.name) {
            setPoke({ key: `e-${e.id}`, type: e.type, at: e.at });
          }
        } else if (msg.t === "lines") {
          setChat(msg.lines.map((l) => ohmSaid(l))); // history: never a why
          setLoaded((l) => ({ ...l, chat: msg.lines.at(-1)?.id ?? 0 }));
        } else if (msg.t === "line") setChat((c) => [...c, ohmSaid(msg.line, msg.why)].slice(-CHAT_SIZE));
        else if (msg.t === "unsay") setChat((c) => c.filter((item) => item.lineId !== msg.id));
        else if (msg.t === "notice") setToast({ text: msg.msg, bad: false });
        else if (msg.t === "error") setToast({ text: msg.msg, bad: true });
      };
      socket.onclose = (ev) => {
        if (stopped) return;
        setConnected(false);
        if (ev.code === BANNED) return setBanned(true); // the server refuses a banned visitor, so don't retry
        timer = setTimeout(connect, Math.min(30_000, 1_000 * 2 ** retry++));
      };
    };

    connect();
    return () => {
      stopped = true;
      clearTimeout(timer);
      ws.current?.close();
    };
  }, []);

  // Re-render every second so the bars drain smoothly.
  useEffect(() => {
    const tick = () => setDeviceNow(Date.now());
    const first = setTimeout(tick, 0);
    const every = setInterval(tick, 1_000);
    return () => {
      clearTimeout(first);
      clearInterval(every);
    };
  }, []);

  // Remember when you leave, for "while you were away" next time. Leaving = the page gets hidden:
  // closing the tab or switching apps on a phone. That's the one moment every browser reports.
  useEffect(() => {
    const leave = () => {
      if (document.visibilityState !== "hidden") return;
      try {
        localStorage.setItem("ohm-last-seen", String(Date.now()));
      } catch {
        // storage blocked: no "while you were away"
      }
    };
    document.addEventListener("visibilitychange", leave);
    return () => document.removeEventListener("visibilitychange", leave);
  }, []);

  // Messages disappear after 4 s.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4_000);
    return () => clearTimeout(t);
  }, [toast]);

  const send = useCallback((msg: ClientMsg) => {
    if (ws.current?.readyState !== WebSocket.OPEN) return false;
    ws.current.send(JSON.stringify(msg));
    return true;
  }, []);

  const rename = useCallback(
    (newName: string) => {
      me.current.name = newName;
      setName(newName);
      try {
        localStorage.setItem("ohm-name", newName);
      } catch {
        // storage blocked: the name lasts until the page reloads
      }
      send({ t: "hello", ...me.current });
    },
    [send],
  );

  const say = useCallback(
    (text: string) => {
      if (Date.now() < sayUntil || !send({ t: "say", text })) return;
      setSayUntil(Date.now() + SAY_GAP_MS);
      // Your own message is shown only here: the server never sends it to anyone else.
      setChat((c) => [...c, { key: `you-${Date.now()}`, from: "you" as const, text }].slice(-CHAT_SIZE));
    },
    [send, sayUntil],
  );

  // Charge, play and reboot share one cooldown on the server. The buttons wait it out here, so nobody
  // runs into an error, and Ohm reacts the moment you press instead of when the server answers.
  const care = (t: "charge" | "play" | "reboot") => {
    if (Date.now() < careUntil || !send({ t })) return;
    setCareUntil(Date.now() + CARE_GAP_MS);
    navigator.vibrate?.(10); // a tiny buzz where phones support it (Android); iPhones ignore it
    if (t !== "reboot") setPoke({ key: `me-${Date.now()}`, type: t, at: Date.now() + offset });
  };
  // Pat or frown at Ohm's reply to you. It only moves Ohm's Expression skill; the server takes one vote per line.
  const rate = (lineId: number, pat: boolean) => {
    if (lineId in votes || !send({ t: "rate", lineId, pat })) return;
    const next = { ...votes, [lineId]: pat };
    setVotes(next);
    try {
      localStorage.setItem(RATED_KEY, JSON.stringify(Object.fromEntries(Object.entries(next).slice(-50)))); // the newest 50
    } catch {
      // storage blocked: the buttons come back after a reload, and the server refuses a second vote
    }
    if (pat) setPoke({ key: `pat-${lineId}`, type: "pat", at: Date.now() + offset }); // Ohm hops, with a heart
  };

  return {
    pet,
    weather,
    brain,
    unlocked,
    away,
    online,
    feed,
    chat,
    connected,
    banned,
    toast,
    name,
    /** Server time, updated every second. 0 until the first tick. */
    now: deviceNow ? deviceNow + offset : 0,
    poke,
    loaded,
    /** True for a few seconds after a charge, play or reboot: the server wouldn't take another one yet. */
    resting: deviceNow < careUntil,
    /** Seconds until you may chat again, 0 = now. */
    sayWait: Math.min(SAY_GAP_MS / 1000, Math.max(0, Math.ceil((sayUntil - deviceNow) / 1000))),
    charge: () => care("charge"),
    play: () => care("play"),
    reboot: () => care("reboot"),
    report: (lineId: number) => send({ t: "report", lineId }),
    rename,
    say,
    votes,
    rate,
    dismissAway: () => setAway(null),
  };
}