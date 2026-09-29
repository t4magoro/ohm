"use client";

import { useEffect, useRef } from "react";

// ponytail: guessed values. Raise SHAKE_FORCE if walking counts as a shake, lower it if real shakes don't.
const SHAKE_FORCE = 25; // m/s², gravity included (a phone lying still reads about 9.8)
const SHAKE_GAP = 3_000; // same as the server's cooldown, so one long shake counts once

type MotionWithPermission = { requestPermission?: () => Promise<"granted" | "denied"> };
const Motion = () => DeviceMotionEvent as unknown as MotionWithPermission;

/** Phones and tablets. Desktops have no motion sensor, so they don't get the shake hint. */
export const canShake = () => typeof navigator !== "undefined" && navigator.maxTouchPoints > 0;

/** iPhones only send motion events after the visitor taps a button to allow them. */
export const shakeNeedsPermission = () =>
  canShake() && typeof DeviceMotionEvent !== "undefined" && typeof Motion().requestPermission === "function";

/** Must be called from a tap (a click handler), or the iPhone refuses without asking. */
export async function askShakePermission() {
  try {
    return (await Motion().requestPermission?.()) === "granted";
  } catch {
    return false;
  }
}

/** Calls onShake when the phone is shaken hard, at most once every 3 s. */
export function useShake(onShake: () => void, enabled: boolean) {
  const latest = useRef(onShake);
  useEffect(() => {
    latest.current = onShake;
  });

  useEffect(() => {
    if (!enabled) return;
    let last = 0;
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a || a.x === null || a.y === null || a.z === null) return;
      const now = Date.now();
      if (Math.hypot(a.x, a.y, a.z) > SHAKE_FORCE && now - last > SHAKE_GAP) {
        last = now;
        latest.current();
      }
    };
    window.addEventListener("devicemotion", onMotion);
    return () => window.removeEventListener("devicemotion", onMotion);
  }, [enabled]);
}