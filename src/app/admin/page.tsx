"use client";

import { useEffect, useState } from "react";
import { AdminCard, List } from "@/components/admin/AdminCard";
import { BatteryForm } from "@/components/admin/BatteryForm";
import { LoginForm } from "@/components/admin/LoginForm";
import { AnswerRow, BanRow, BlockedRow, PendingRow, ReportRow, WordRow, type Run } from "@/components/admin/ModerationRows";
import { ResetForm } from "@/components/admin/ResetForm";
import { SearchResults } from "@/components/admin/SearchResults";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { adminApi } from "@/lib/adminApi";import type { AdminOverview, AdminSearch, Settings } from "@/lib/protocol";

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
      adminApi(token, `search?q=${encodeURIComponent(q)}`)
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
      if (path) await adminApi(token, path, body);
      setData(await adminApi(token, "overview"));
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
        <LoginForm token={token} busy={busy} onToken={setToken} onOpen={() => run()} />
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
        <SearchResults q={q} results={results} run={act} busy={busy} />
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-2">
          <AdminCard id="waiting" title="Waiting for approval" count={data.pending.length}>
            <List empty="Nothing waiting.">
              {data.pending.map((p) => (
                <PendingRow key={p.word} item={p} run={act} busy={busy} />
              ))}
            </List>
          </AdminCard>

          <AdminCard id="reports" title="Reports" count={data.reports.length}>
            <List empty="No reports.">
              {data.reports.map((r) => (
                <ReportRow key={r.id} item={r} run={act} busy={busy} />
              ))}
            </List>
          </AdminCard>

          <AdminCard id="battery" title="Battery">
            <BatteryForm
              draft={hours ?? data.settings}
              dirty={hours !== null}
              busy={busy}
              onChange={setHours}
              onSave={async () => {
                if (await run("settings", hours ?? data.settings, "Saved: every open page switched speed")) setHours(null);
              }}
            />
          </AdminCard>

          <AdminCard id="words" title="Newest words" count={data.words.length}>
            <List empty="Ohm doesn't know any words yet.">
              {data.words.map((w) => (
                <WordRow key={w.word} item={w} run={act} busy={busy} />
              ))}
            </List>
          </AdminCard>

          {/* Whole answers Ohm may say back to anyone (ohm-api answers.ts). Forgotten ones can come back if people give them again. */}
          <AdminCard id="answers" title="Kept answers" count={data.answers.length}>
            <List empty="None yet. When people answer Ohm, he keeps their answers here.">
              {data.answers.map((a) => (
                <AnswerRow key={a.text} item={a} run={act} busy={busy} />
              ))}
            </List>
          </AdminCard>

          <AdminCard id="blocked" title="Words you blocked" count={data.blocked.length}>
            <List empty="None. (block.txt words aren't listed here.)">
              {data.blocked.map((b) => (
                <BlockedRow key={b.word} item={b} run={act} busy={busy} />
              ))}
            </List>
          </AdminCard>

          <AdminCard id="bans" title="Bans" count={data.bans.length}>
            <List empty="Nobody is banned.">
              {data.bans.map((b) => (
                <BanRow key={b.ipHash} item={b} run={act} busy={busy} />
              ))}
            </List>
          </AdminCard>
          <AdminCard id="reset" title="Reset Ohm's brain">
            <ResetForm busy={busy} onReset={() => run("reset", { confirm: "RESET" }, "Ohm's brain was reset: it learns from zero again")} />
          </AdminCard>
        </div>
      )}
    </main>
  );
}
