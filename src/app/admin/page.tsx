"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CardSkeleton } from "@/components/Skeleton";
import { HOURS_RANGE, type AdminOverview, type AdminSearch, type Settings } from "@/lib/protocol";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";
const when = (at: number) => new Date(at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
const hoursInput = "w-20 border-2 border-edge bg-screen px-1 text-lg outline-none caret-pink focus:border-pink";
// Text buttons like [approve]: green for yes, red for the ones that take something away.
const good = "term-btn text-mint hover:text-screen focus-visible:text-screen";
const bad = "term-btn text-danger hover:text-screen focus-visible:text-screen";

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

/** Runs an admin action: (path, body, message shown when it worked). */
type Run = (path: string, body: object, done: string) => void;

function Card({ id, title, count, children }: { id: string; title: string; count?: number; children: ReactNode }) {
  return (
    <section id={id} className="card scroll-mt-24 p-3">
      <h2 className="mb-2 font-pixel text-sm font-bold">
        {title} {count !== undefined && <span className="text-lemon">({count})</span>}
      </h2>
      {children}
    </section>
  );
}

function List({ empty, children }: { empty: string; children: ReactNode[] }) {
  return children.length === 0 ? <p className="text-dim">{empty}</p> : <ul className="divide-y-2 divide-edge">{children}</ul>;
}

/** One line of a list: the word, grey details, and its actions on the right. */
function Row({ word, meta, children }: { word: ReactNode; meta?: ReactNode; children: ReactNode }) {
  return (
    <li className="flex flex-wrap items-baseline gap-x-3 py-1.5">
      <span className="text-lemon">{word}</span>
      {meta && <span className="text-dim">{meta}</span>}
      <span className="ml-auto flex flex-wrap gap-1">{children}</span>
    </li>
  );
}

// The rows, shared by the lists and the search results so both work the same way.
const PendingRow = ({ p, run, busy }: { p: AdminOverview["pending"][number]; run: Run; busy: boolean }) => (
  <Row word={p.word} meta={`seen ${p.seen}x`}>
    <button type="button" className={good} disabled={busy} onClick={() => run("approve", { word: p.word, lang: "id" }, `Ohm learned "${p.word}"`)}>
      [approve id]
    </button>
    <button type="button" className={good} disabled={busy} onClick={() => run("approve", { word: p.word, lang: "en" }, `Ohm learned "${p.word}"`)}>
      [approve en]
    </button>
    <button type="button" className={bad} disabled={busy} onClick={() => run("block", { word: p.word }, `Blocked "${p.word}"`)}>
      [block]
    </button>
  </Row>
);

const WordRow = ({ w, run, busy }: { w: AdminOverview["words"][number]; run: Run; busy: boolean }) => (
  <Row word={w.word} meta={`by ${w.by}, ${when(w.at)}`}>
    <button
      type="button"
      className={bad}
      disabled={busy}
      // Forgetting deletes everything Ohm learned around the word, so it asks first.
      onClick={() => confirm(`Forget "${w.word}" and block it?`) && run("block", { word: w.word }, `Ohm forgot "${w.word}"`)}
    >
      [forget + block]
    </button>
    {w.ipHash && (
      <button type="button" className={bad} disabled={busy} onClick={() => run("ban", { ipHash: w.ipHash }, `Banned ${w.ipHash}`)}>
        [ban teacher]
      </button>
    )}
  </Row>
);

const BlockedRow = ({ b, run, busy }: { b: AdminOverview["blocked"][number]; run: Run; busy: boolean }) => (
  <Row word={b.word}>
    <button type="button" className={good} disabled={busy} onClick={() => run("unblock", { word: b.word }, `Unblocked "${b.word}"`)}>
      [unblock]
    </button>
  </Row>
);

const ReportRow = ({ r, run, busy }: { r: AdminOverview["reports"][number]; run: Run; busy: boolean }) => (
  <Row word={`"${r.text}"`} meta={`Ohm to ${r.to ?? "a deleted line"}, ${when(r.at)}`}>
    <button
      type="button"
      className={bad}
      disabled={busy}
      onClick={() => confirm("Delete this line for everyone?") && run("unsay", { id: r.lineId }, "Line deleted for everyone")}
    >
      [delete line]
    </button>
    {r.ipHash && (
      <button type="button" className={bad} disabled={busy} onClick={() => run("ban", { ipHash: r.ipHash }, `Banned ${r.ipHash}`)}>
        [ban]
      </button>
    )}
    <button type="button" className={good} disabled={busy} onClick={() => run("dismiss", { id: r.id }, "Report dismissed")}>
      [dismiss]
    </button>
  </Row>
);

export default function Admin() {
  const [token, setToken] = useState(""); // only in memory: gone when you close the tab
  const [data, setData] = useState<AdminOverview | null>(null);
  const [status, setStatus] = useState("");
  const [hours, setHours] = useState<Settings | null>(null); // the battery form while you edit it
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState(""); // what's typed in the search box
  const [found, setFound] = useState<AdminSearch | null>(null);
  const q = query.trim().toLowerCase();

  // Search as you type, a moment after you stop typing. Old answers that arrive late are ignored.
  useEffect(() => {
    if (!q || !data) return;
    let live = true;
    const t = setTimeout(() => {
      api(token, `search?q=${encodeURIComponent(q)}`)
        .then((result: AdminSearch) => live && setFound(result))
        .catch((e: Error) => live && setStatus(`Error: ${e.message}`));
    }, 250);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [q, token, data]);

  /** Runs one admin action (or none), then reloads everything, search included. Returns true if it worked. */
  async function run(path?: string, body?: object, done = "") {
    setBusy(true);
    try {
      if (path) await api(token, path, body);
      setData(await api(token, "overview"));
      setStatus(done);
      return true;
    } catch (e) {
      setStatus(`Error: ${(e as Error).message}`);
      return false;
    } finally {
      setBusy(false);
    }
  }
  const act: Run = (path, body, done) => void run(path, body, done);

  if (!data) {
    return (
      <main className="mx-auto w-full max-w-6xl space-y-5 px-4 py-6">
        <h1 className="title-outline font-pixel text-3xl font-bold leading-none">Ohm admin</h1>
        <form
          className="term flex max-w-md items-center gap-2 px-3 py-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            run();
          }}
        >
          <label htmlFor="token" className="sr-only">
            Admin token
          </label>
          <span className="text-pink" aria-hidden>
            $
          </span>
          <input
            id="token"
            type="password"
            autoComplete="current-password"
            placeholder="admin token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="term-input"
          />
          <button className="term-btn" disabled={!token || busy}>
            [open]
          </button>
        </form>
        {status && (
          <p role="status" className="text-danger">
            {status}
          </p>
        )}
        {busy && (
          <div className="grid gap-5 lg:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}
      </main>
    );
  }

  const draft = hours ?? data.settings;
  const results = q && found?.q === q ? found : null;
  const tiles: [string, string, number, boolean][] = [
    ["waiting", "waiting", data.pending.length, true],
    ["reports", "reports", data.reports.length, true],
    ["words", "newest words", data.words.length, false],
    ["blocked", "blocked", data.blocked.length, false],
    ["bans", "bans", data.bans.length, false],
  ];

  return (
    <main className="mx-auto w-full max-w-6xl space-y-5 px-4 py-6">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="title-outline font-pixel text-3xl font-bold leading-none">Ohm admin</h1>
        <div className="ml-auto flex gap-3">
          <button type="button" className="btn" disabled={busy} onClick={() => run(undefined, undefined, "Refreshed")}>
            refresh
          </button>
          <button type="button" className="btn" onClick={() => (setToken(""), setData(null), setStatus(""))}>
            lock
          </button>
        </div>
      </header>

      {/* What needs you, at a glance. Each tile jumps to its list. */}
      <nav aria-label="Sections" className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {tiles.map(([id, label, n, urgent]) => (
          <a key={id} href={`#${id}`} className={`card block px-3 py-2 ${urgent && n > 0 ? "border-pink" : ""}`}>
            <span className="font-pixel text-[10px] text-dim">{label}</span>
            <span className={`block text-3xl leading-none ${urgent && n > 0 ? "text-pink" : "text-lemon"}`}>{n}</span>
          </a>
        ))}
      </nav>

      {/* Stays at the top while you scroll, on a frosted strip so the lists slide under it. */}
      <div className="sticky top-0 z-10 -mx-4 space-y-2 bg-background/85 px-4 py-2 backdrop-blur-sm">
        <form className="term flex items-center gap-2 px-3 py-1.5" onSubmit={(e) => e.preventDefault()} role="search">
          <label htmlFor="search" className="text-pink">
            $ search
          </label>
          <input
            id="search"
            type="search"
            placeholder="any word Ohm knows, is waiting for or is blocked"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!e.target.value.trim()) setFound(null);
            }}
            maxLength={32}
            className="term-input"
          />
          {query && (
            <button type="button" className="term-btn" onClick={() => (setQuery(""), setFound(null))}>
              [clear]
            </button>
          )}
        </form>
        <p role="status" className={`min-h-6 ${status.startsWith("Error") ? "text-danger" : "text-mint"}`}>
          {status && `> ${status}`}
        </p>
      </div>

      {q ? (
        <Card id="search" title={`Words with "${q}"`}>
          {!results ? (
            <p className="text-dim">searching...</p>
          ) : (
            <div className="space-y-4">
              <List empty="Ohm doesn't know a word like that.">
                {results.words.map((w) => (
                  <WordRow key={w.word} w={w} run={act} busy={busy} />
                ))}
              </List>
              {results.pending.length > 0 && (
                <div>
                  <h3 className="font-pixel text-[10px] text-dim">waiting for approval</h3>
                  <List empty="">
                    {results.pending.map((p) => (
                      <PendingRow key={p.word} p={p} run={act} busy={busy} />
                    ))}
                  </List>
                </div>
              )}
              {results.blocked.length > 0 && (
                <div>
                  <h3 className="font-pixel text-[10px] text-dim">blocked</h3>
                  <List empty="">
                    {results.blocked.map((b) => (
                      <BlockedRow key={b.word} b={b} run={act} busy={busy} />
                    ))}
                  </List>
                </div>
              )}
            </div>
          )}
        </Card>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-2">
          <Card id="waiting" title="Waiting for approval" count={data.pending.length}>
            <List empty="Nothing waiting.">
              {data.pending.map((p) => (
                <PendingRow key={p.word} p={p} run={act} busy={busy} />
              ))}
            </List>
          </Card>

          <Card id="reports" title="Reports" count={data.reports.length}>
            <List empty="No reports.">
              {data.reports.map((r) => (
                <ReportRow key={r.id} r={r} run={act} busy={busy} />
              ))}
            </List>
          </Card>

          <Card id="battery" title="Battery">
            <form
              className="flex flex-wrap items-center gap-x-5 gap-y-2"
              onSubmit={async (e) => {
                e.preventDefault();
                if (await run("settings", draft, "Saved: every open page switched speed")) setHours(null);
              }}
            >
              <label className="flex items-center gap-2">
                charge lasts
                <input
                  type="number"
                  min={HOURS_RANGE[0]}
                  max={HOURS_RANGE[1]}
                  step={0.5}
                  value={draft.chargeHours}
                  onChange={(e) => setHours({ ...draft, chargeHours: Number(e.target.value) })}
                  className={hoursInput}
                />
                h
              </label>
              <label className="flex items-center gap-2">
                mood lasts
                <input
                  type="number"
                  min={HOURS_RANGE[0]}
                  max={HOURS_RANGE[1]}
                  step={0.5}
                  value={draft.moodHours}
                  onChange={(e) => setHours({ ...draft, moodHours: Number(e.target.value) })}
                  className={hoursInput}
                />
                h
              </label>
              <button className="btn" disabled={busy || !hours}>
                save
              </button>
            </form>
            <p className="mt-2 text-dim">
              How long a full bar lasts on a normal day ({HOURS_RANGE[0]} to {HOURS_RANGE[1]} h). Night makes it last twice
              as long; heat and rain shorten it.
            </p>
          </Card>

          <Card id="words" title="Newest words" count={data.words.length}>
            <List empty="Ohm doesn't know any words yet.">
              {data.words.map((w) => (
                <WordRow key={w.word} w={w} run={act} busy={busy} />
              ))}
            </List>
          </Card>

          <Card id="blocked" title="Words you blocked" count={data.blocked.length}>
            <List empty="None. (block.txt words aren't listed here.)">
              {data.blocked.map((b) => (
                <BlockedRow key={b.word} b={b} run={act} busy={busy} />
              ))}
            </List>
          </Card>

          <Card id="bans" title="Bans" count={data.bans.length}>
            <List empty="Nobody is banned.">
              {data.bans.map((b) => (
                <Row key={b.ipHash} word={<code>{b.ipHash}</code>} meta={when(b.at)}>
                  <button type="button" className={good} disabled={busy} onClick={() => act("unban", { ipHash: b.ipHash }, `Unbanned ${b.ipHash}`)}>
                    [unban]
                  </button>
                </Row>
              ))}
            </List>
          </Card>
        </div>
      )}
    </main>
  );
}
