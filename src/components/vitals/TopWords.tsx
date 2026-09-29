import type { Vitals } from "@/lib/protocol";

/** The words visitors type most, how often Ohm said them, and who taught them. */
export function TopWords({ words }: { words: Vitals["topWords"] }) {
  return (
    <section className="card space-y-2 p-3">
      <h2 className="font-pixel text-sm font-bold">Top words</h2>
      {words.length === 0 ? (
        <p className="text-dim">Ohm hasn&apos;t learned any words yet.</p>
      ) : (
        <table className="w-full">
          <thead className="text-left text-dim">
            <tr>
              <th className="font-normal">Word</th>
              <th className="font-normal">Typed</th>
              <th className="font-normal">Ohm said it</th>
              <th className="font-normal">Taught by</th>
            </tr>
          </thead>
          <tbody>
            {words.map((w) => (
              <tr key={w.word}>
                <td>{w.word}</td>
                <td>{w.uses}×</td>
                <td>{w.said}×</td>
                <td>{w.by}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
