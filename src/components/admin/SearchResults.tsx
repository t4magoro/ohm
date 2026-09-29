import type { AdminSearch } from "@/lib/protocol";
import { AdminCard, List } from "./AdminCard";
import { BlockedRow, PendingRow, WordRow, type Run } from "./ModerationRows";

type Props = { q: string; results: AdminSearch | null; run: Run; busy: boolean };

/** Every word containing what you typed: known words first, then waiting and blocked ones. */
export function SearchResults({ q, results, run, busy }: Props) {
  return (
    <AdminCard id="search" title={`Words with "${q}"`}>
      {!results ? (
        <p className="text-dim">searching...</p>
      ) : (
        <div className="space-y-4">
          <List empty="Ohm doesn't know a word like that.">
            {results.words.map((w) => (
              <WordRow key={w.word} item={w} run={run} busy={busy} />
            ))}
          </List>
          {results.pending.length > 0 && (
            <div>
              <h3 className="font-pixel text-[10px] text-dim">waiting for approval</h3>
              <List empty="">
                {results.pending.map((p) => (
                  <PendingRow key={p.word} item={p} run={run} busy={busy} />
                ))}
              </List>
            </div>
          )}
          {results.blocked.length > 0 && (
            <div>
              <h3 className="font-pixel text-[10px] text-dim">blocked</h3>
              <List empty="">
                {results.blocked.map((b) => (
                  <BlockedRow key={b.word} item={b} run={run} busy={busy} />
                ))}
              </List>
            </div>
          )}
        </div>
      )}
    </AdminCard>
  );
}
