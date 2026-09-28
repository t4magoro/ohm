"use client";

import { useState, type ReactNode } from "react";
import { HOURS_RANGE, type AdminOverview, type Settings } from "@/lib/protocol";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";
const button = "rounded border-2 border-current px-4 py-1 font-bold disabled:opacity-40";
const small = "rounded border border-current px-2 py-0.5 text-xs disabled:opacity-40";
const input = "ml-2 w-20 rounded border-2 border-current bg-transparent px-1";
const when = (at: number) => new Date(at).toLocaleString();

/** Calls the admin API. The token goes in a header, never in the URL: URLs end up in logs and history. */
async function api(token: string, path: string, body?: object) {
  const res = await fetch(`${API}/admin/${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? `The API answered ${res.status}`);
  return json;
}

function Section({ title, count, empty, children }: { title: string; count: number; empty: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 font-bold">
        {title} ({count})
      </h2>
      {count === 0 ? <p className="opacity-70">{empty}</p> : <ul className="space-y-2">{children}</ul>}
    </section>
  );
}

export default function Admin() {
  const [token, setToken] = useState(""); // only in memory: gone when you close the tab
  const [data, setData] = useState<AdminOverview | null>(null);
  const [status, setStatus] = useState("");
  const [hours, setHours] = useState<Settings | null>(null); // the battery form while you edit it
  const [busy, setBusy] = useState(false);

  /** Runs one admin action (or none), then reloads everything. Returns true if it worked. */
  async function run(path?: string, body?: object, done = "") {
    setBusy(true);
    try {
      if (path) await api(token, path, body);
      setData(await api(token, "overview"));
      setStatus(done);
      return true;
    } catch (e) {
      setStatus(`❌ ${(e as Error).message}`);
      return false;
    } finally {
      setBusy(false);
    }
  }

  if (!data) {
    return (
      <main className="mx-auto w-full max-w-2xl space-y-4 p-6 font-mono text-sm">
        <h1 className="text-2xl font-bold">Ohm admin</h1>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            run();
          }}
        >
          <label htmlFor="token" className="sr-only">
            Admin token
          </label>
          <input
            id="token"
            type="password"
            autoComplete="current-password"
            placeholder="Admin token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="min-w-0 flex-1 rounded border-2 border-current bg-transparent px-2 py-1"
          />
          <button className={button} disabled={!token || busy}>
            Open
          </button>
        </form>
        {status && <p role="status">{status}</p>}
      </main>
    );
  }

  const draft = hours ?? data.settings;

  return (
    <main className="mx-auto w-full max-w-2xl space-y-8 p-6 font-mono text-sm">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">Ohm admin</h1>
        <button type="button" className={small} disabled={busy} onClick={() => run(undefined, undefined, "Refreshed")}>
          Refresh
        </button>
      </header>
      {status && <p role="status">{status}</p>}

      <section>
        <h2 className="mb-2 font-bold">🔋 Battery</h2>
        <form
          className="flex flex-wrap items-center gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (await run("settings", draft, "Saved: every open page switched speed")) setHours(null);
          }}
        >
          <label>
            Charge lasts
            <input
              type="number"
              min={HOURS_RANGE[0]}
              max={HOURS_RANGE[1]}
              step={0.5}
              value={draft.chargeHours}
              onChange={(e) => setHours({ ...draft, chargeHours: Number(e.target.value) })}
              className={input}
            />{" "}
            h
          </label>
          <label>
            Mood lasts
            <input
              type="number"
              min={HOURS_RANGE[0]}
              max={HOURS_RANGE[1]}
              step={0.5}
              value={draft.moodHours}
              onChange={(e) => setHours({ ...draft, moodHours: Number(e.target.value) })}
              className={input}
            />{" "}
            h
          </label>
          <button className={small} disabled={busy || !hours}>
            Save
          </button>
        </form>
        <p className="mt-1 text-xs opacity-70">On a normal day. Night makes it last twice as long; heat and rain shorten it.</p>
      </section>

      <Section title="📥 Words waiting for approval" count={data.pending.length} empty="Nothing waiting.">
        {data.pending.map((p) => (
          <li key={p.word} className="flex flex-wrap items-center gap-2">
            <b>{p.word}</b> <span className="opacity-70">seen {p.seen}×</span>
            <button type="button" className={small} disabled={busy} onClick={() => run("approve", { word: p.word, lang: "id" }, `Ohm learned “${p.word}”`)}>
              Approve (Indonesian)
            </button>
            <button type="button" className={small} disabled={busy} onClick={() => run("approve", { word: p.word, lang: "en" }, `Ohm learned “${p.word}”`)}>
              Approve (English)
            </button>
            <button type="button" className={small} disabled={busy} onClick={() => run("block", { word: p.word }, `Blocked “${p.word}”`)}>
              Block
            </button>
          </li>
        ))}
      </Section>

      <Section title="🚩 Reports" count={data.reports.length} empty="No reports.">
        {data.reports.map((r) => (
          <li key={r.id} className="space-y-1">
            <p>
              “{r.text}” <span className="opacity-70">(Ohm → {r.to ?? "deleted line"}, {when(r.at)})</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={small} disabled={busy} onClick={() => run("unsay", { id: r.lineId }, "Line deleted for everyone")}>
                Delete the line
              </button>
              {r.ipHash && (
                <button type="button" className={small} disabled={busy} onClick={() => run("ban", { ipHash: r.ipHash }, `Banned ${r.ipHash}`)}>
                  Ban who made Ohm say it
                </button>
              )}
              <button type="button" className={small} disabled={busy} onClick={() => run("dismiss", { id: r.id }, "Report dismissed")}>
                Dismiss
              </button>
            </div>
          </li>
        ))}
      </Section>

      <Section title="🧠 Newest words" count={data.words.length} empty="Ohm doesn't know any words yet.">
        {data.words.map((w) => (
          <li key={w.word} className="flex flex-wrap items-center gap-2">
            <b>{w.word}</b>
            <span className="opacity-70">
              by {w.by}, {when(w.at)}
            </span>
            <button type="button" className={small} disabled={busy} onClick={() => run("block", { word: w.word }, `Ohm forgot “${w.word}”`)}>
              Forget + block
            </button>
            {w.ipHash && (
              <button type="button" className={small} disabled={busy} onClick={() => run("ban", { ipHash: w.ipHash }, `Banned ${w.ipHash}`)}>
                Ban who taught it
              </button>
            )}
          </li>
        ))}
      </Section>

      <Section title="⛔ Words you blocked" count={data.blocked.length} empty="None. (block.txt words aren't listed here.)">
        {data.blocked.map((b) => (
          <li key={b.word} className="flex items-center gap-2">
            <b>{b.word}</b>
            <button type="button" className={small} disabled={busy} onClick={() => run("unblock", { word: b.word }, `Unblocked “${b.word}”`)}>
              Unblock
            </button>
          </li>
        ))}
      </Section>

      <Section title="🚫 Bans" count={data.bans.length} empty="Nobody is banned.">
        {data.bans.map((b) => (
          <li key={b.ipHash} className="flex items-center gap-2">
            <code>{b.ipHash}</code> <span className="opacity-70">{when(b.at)}</span>
            <button type="button" className={small} disabled={busy} onClick={() => run("unban", { ipHash: b.ipHash }, `Unbanned ${b.ipHash}`)}>
              Unban
            </button>
          </li>
        ))}
      </Section>
    </main>
  );
}