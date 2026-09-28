"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ClientMsg, FeedEvent, Pet, ServerMsg, Weather } from "./protocol";

const WS_URL = `${(process.env.NEXT_PUBLIC_API_URL ?? "").replace(/^http/, "ws")}/ws`;
const FEED_SIZE = 30;

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
  const [online, setOnline] = useState(0);
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [deviceNow, setDeviceNow] = useState(0);
  const [offset, setOffset] = useState(0); // server clock − this device's clock
  const ws = useRef<WebSocket | null>(null);
  const me = useRef({ id: "", name: "" });

  // Connect, and reconnect after a drop: 1 s, 2 s, 4 s … up to 30 s. Every deploy drops all connections.
  useEffect(() => {
    me.current = { id: remembered("ohm-id", randomId), name: remembered("ohm-name", guestName) };
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
        socket.send(JSON.stringify({ t: "hello", ...me.current } satisfies ClientMsg));
      };
      socket.onmessage = (ev) => {
        const msg = JSON.parse(ev.data as string) as ServerMsg;
        if (msg.t === "state") {
          setPet(msg.pet);
          setWeather(msg.weather);
          setOffset(msg.now - Date.now());
        } else if (msg.t === "online") setOnline(msg.online);
        else if (msg.t === "feed") setFeed(msg.events);
        else if (msg.t === "event") setFeed((f) => [msg.e, ...f].slice(0, FEED_SIZE));
        else if (msg.t === "error") setError(msg.msg);
      };
      socket.onclose = () => {
        if (stopped) return;
        setConnected(false);
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

  // Error messages disappear after 4 s.
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 4_000);
    return () => clearTimeout(t);
  }, [error]);

  const send = useCallback((msg: ClientMsg) => {
    if (ws.current?.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify(msg));
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

  return {
    pet,
    weather,
    online,
    feed,
    connected,
    error,
    name,
    /** Server time, updated every second. 0 until the first tick. */
    now: deviceNow ? deviceNow + offset : 0,
    charge: () => send({ t: "charge" }),
    play: () => send({ t: "play" }),
    reboot: () => send({ t: "reboot" }),
    rename,
  };
}