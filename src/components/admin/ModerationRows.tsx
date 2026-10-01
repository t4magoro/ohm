import { dateAndTime } from "@/lib/format";
import type { AdminOverview } from "@/lib/protocol";
import { Row } from "./AdminCard";

// One row per thing you can moderate, with its actions. The lists and the search results share them,
// so a word works the same wherever you find it.

/** Runs an admin action: (path, body, message shown when it worked). */
export type Run = (path: string, body: object, done: string) => void;
type RowProps<T> = { item: T; run: Run; busy: boolean };

// Text buttons like [approve]: green for yes, red for the ones that take something away.
const good = "term-btn text-mint hover:text-screen focus-visible:text-screen";
const bad = "term-btn text-danger hover:text-screen focus-visible:text-screen";

export const PendingRow = ({ item: p, run, busy }: RowProps<AdminOverview["pending"][number]>) => (
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

export const WordRow = ({ item: w, run, busy }: RowProps<AdminOverview["words"][number]>) => (
  <Row word={w.word} meta={`by ${w.by}, ${dateAndTime(w.at)}`}>
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

export const BlockedRow = ({ item: b, run, busy }: RowProps<AdminOverview["blocked"][number]>) => (
  <Row word={b.word}>
    <button type="button" className={good} disabled={busy} onClick={() => run("unblock", { word: b.word }, `Unblocked "${b.word}"`)}>
      [unblock]
    </button>
  </Row>
);

export const ReportRow = ({ item: r, run, busy }: RowProps<AdminOverview["reports"][number]>) => (
  <Row word={`"${r.text}"`} meta={`Ohm to ${r.to ?? "a deleted line"}, ${dateAndTime(r.at)}`}>
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


export const AnswerRow = ({ item: a, run, busy }: RowProps<AdminOverview["answers"][number]>) => (
  <Row word={`"${a.text}"`} meta={`given ${a.n}x, ${dateAndTime(a.at)}`}>
    <button type="button" className={bad} disabled={busy} onClick={() => run("forget", { text: a.text }, `Ohm forgot "${a.text}"`)}>
      [forget]
    </button>
  </Row>
);

export const BanRow = ({ item: b, run, busy }: RowProps<AdminOverview["bans"][number]>) => (
  <Row word={<code>{b.ipHash}</code>} meta={dateAndTime(b.at)}>
    <button type="button" className={good} disabled={busy} onClick={() => run("unban", { ipHash: b.ipHash }, `Unbanned ${b.ipHash}`)}>
      [unban]
    </button>
  </Row>
);
