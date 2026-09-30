"use client";

import { useState, type ReactNode } from "react";
import { Backdrop } from "@/components/pixel/Backdrop";
import { Device, type DeviceButton } from "@/components/pixel/Device";
import { AwayBanner } from "@/components/sections/AwayBanner";
import { Chat } from "@/components/sections/Chat";
import { Feed } from "@/components/sections/Feed";
import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/sections/Header";
import { Pet } from "@/components/sections/Pet";
import { Spellbook } from "@/components/sections/Spellbook";
import { StatusCard } from "@/components/sections/StatusCard";
import { BootScreen, CardSkeleton, TermSkeleton } from "@/components/ui/Skeleton";
import { TabBar, type Tab } from "@/components/ui/TabBar";
import { Toast } from "@/components/ui/Toast";
import { useOhm } from "@/hooks/useOhm";
import { askShakePermission, canShake, shakeNeedsPermission, useShake } from "@/hooks/useShake";
import { isOff, skyOf } from "@/lib/ohmState";
import { valueNow } from "@/lib/protocol";
import { skyLook } from "@/lib/skyLook";

const nothing = () => {};
const LOADING_BUTTONS: DeviceButton[] = ["charge", "play", "reboot"].map((label) => ({ label, onClick: nothing, disabled: true }));

// One set of HTML, two layouts, all in CSS:
// - Phone (under lg): a game screen that never scrolls. Ohm on top, a console below with one panel at
//   a time and a tab bar. The columns below are `display: contents`, so their children become rows of
//   <main>'s grid: header (row 1), Ohm (row 2), the panels (all in row 3, one visible), tabs (row 4).
// - Desktop (lg and up): three columns that fill the window. Ohm | status + chat | feed + spellbook.
// --panel is the console's height on phones; --console-top tells the mountains where the ground is.
// Typing mode (phones): while a text box has focus, the keyboard takes half the screen, so Ohm and the
// tab bar step aside and the chat gets all the room (`has-[input:focus]`, the `group/page` hides below).
// Tap anywhere else and everything comes back.
const LAYOUT =
  "group/page relative mx-auto grid h-dvh w-full max-w-[96rem] overflow-hidden text-foreground " +
  "[--panel:40dvh] [--console-top:calc(var(--panel)+3.5rem+3px+env(safe-area-inset-bottom))] " +
  "grid-rows-[auto_minmax(0,1fr)_var(--panel)_auto] max-lg:has-[input:focus]:grid-rows-[auto_0_minmax(0,1fr)_0] " +
  "lg:grid-cols-[minmax(0,26rem)_minmax(22rem,1fr)_minmax(0,22rem)] lg:grid-rows-1 lg:gap-6 lg:p-6";
const COLUMN = "contents lg:flex lg:min-h-0 lg:flex-col lg:gap-5";

/** One panel of the console. On phones only the chosen one shows; on desktop they all do. */
function Panel({ show, scroll, className = "", children }: { show: boolean; scroll?: boolean; className?: string; children: ReactNode }) {
  const scrolls = scroll ? "scroll-quiet overflow-y-auto overscroll-contain lg:overflow-visible" : "";
  return (
    <div className={`col-start-1 row-start-3 min-h-0 px-3 pb-3 pt-4 lg:p-0 ${scrolls} ${show ? "" : "max-lg:hidden"} ${className}`}>
      {children}
    </div>
  );
}

export default function Home() {
  const ohm = useOhm();
  const [tab, setTab] = useState<Tab>("status");
  const [seen, setSeen] = useState({ chat: 0, feed: 0 }); // the newest line you've had a chance to see
  const [shakeAllowed, setShakeAllowed] = useState(false); // iPhones only, after tapping "Allow shaking"

  const off = !ohm.pet || isOff(ohm.pet, ohm.now);
  useShake(() => !off && ohm.play(), !shakeNeedsPermission() || shakeAllowed);

  // The build pre-renders this page with no connection, so the first screen is always the skeleton.
  const { pet, weather, brain, now } = ohm;
  const ready = pet && weather && brain && now ? { pet, weather, brain, now } : null;
    const sky = weather ? skyOf(weather, now) : undefined;
  const look = weather ? skyLook(weather, now) : undefined;

  // Dots on the phone's tabs: news in the chat or feed while you look elsewhere, or Ohm running low.
  const newest = { chat: ohm.chat.findLast((i) => i.from === "ohm")?.lineId ?? 0, feed: ohm.feed[0]?.id ?? 0 };
  const openTab = (next: Tab) => {
    // What was on the tab you leave or open counts as seen.
    setSeen((s) => ({
      chat: next === "chat" || tab === "chat" ? newest.chat : s.chat,
      feed: next === "feed" || tab === "feed" ? newest.feed : s.feed,
    }));
    setTab(next);
  };
  const dots = {
    status: ready && (off || valueNow(ready.pet.charge, ready.now) < 20) ? ("alert" as const) : undefined,
    chat: tab !== "chat" && newest.chat > seen.chat ? ("news" as const) : undefined,
    feed: tab !== "feed" && newest.feed > seen.feed ? ("news" as const) : undefined,
  };

  const connection = ohm.banned ? "banned" : ohm.connected ? `${ohm.online} online` : ready ? "reconnecting..." : "connecting...";

  return (
    <main data-sky={sky} className={LAYOUT}>
      <Backdrop sky={sky} look={look} />
      {/* The phone's console: dark ground under the panels and the tab bar. */}
      <div aria-hidden className="col-start-1 row-span-2 row-start-3 border-t-[3px] border-line bg-screen lg:hidden" />

      <div className={COLUMN}>
        <Header connected={ohm.connected && !ohm.banned} connection={connection} />

        {/* A size container: Ohm's toy grows to fill whatever room is left, on any screen. */}
        <section
          aria-label="Ohm"
          className="col-start-1 row-start-2 grid min-h-0 place-items-center px-4 py-3 [container-type:size] max-lg:group-has-[input:focus]/page:hidden lg:flex-1 lg:p-0"
        >
          {ready ? (
            <Pet
              pet={ready.pet}
              weather={ready.weather}
              now={ready.now}
              feed={ohm.feed}
              chat={ohm.chat}
              unlocked={ohm.unlocked}
              buttons={[
                { label: "charge", onClick: ohm.charge, disabled: off },
                { label: "play", onClick: ohm.play, disabled: off },
                { label: "reboot", onClick: ohm.reboot, disabled: !off },
              ]}
            />
          ) : (
            <div className="relative w-[min(100cqw,92cqh)]">
              <Device
                buttons={LOADING_BUTTONS}
                screen={<BootScreen bad={ohm.banned} text={ohm.banned ? "you've been banned from Ohm" : ohm.connected ? "waking Ohm up" : "connecting"} />}
              />
            </div>
          )}
        </section>
      </div>

      <div className={COLUMN}>
        <Panel show={tab === "status"} scroll className="space-y-3 lg:shrink-0">
          {ready ? <StatusCard {...ready} off={off} /> : <CardSkeleton />}
          {ready && canShake() && (
            <p className="text-center text-dim lg:hidden">
              Shake your phone to play with Ohm.{" "}
              {shakeNeedsPermission() && !shakeAllowed && (
                <button type="button" className="text-pink underline" onClick={async () => setShakeAllowed(await askShakePermission())}>
                  Allow shaking
                </button>
              )}
            </p>
          )}
        </Panel>
        <Panel show={tab === "chat"} className="lg:flex-1">
          {ready ? (
            <Chat items={ohm.chat} disabled={off} name={ohm.name} onSay={ohm.say} onReport={ohm.report} onRename={ohm.rename} />
          ) : (
            <TermSkeleton title="talk to ohm" />
          )}
        </Panel>
      </div>

      <div className={COLUMN}>
        <Panel show={tab === "feed"} className="lg:min-h-48 lg:flex-1">
          {ready ? <Feed events={ohm.feed} now={ready.now} /> : <TermSkeleton title="live feed" />}
        </Panel>
        <Panel show={tab === "book"} scroll className="space-y-4 lg:shrink-0">
          {ready ? <Spellbook brain={ready.brain} /> : <CardSkeleton />}
          <Footer />
        </Panel>
      </div>

      <TabBar tab={tab} onTab={openTab} dots={dots} className="col-start-1 row-start-4 group-has-[input:focus]/page:hidden lg:hidden" />
      {ohm.away && <AwayBanner away={ohm.away} onDismiss={ohm.dismissAway} />}
      <Toast toast={ohm.toast} />
    </main>
  );
}
