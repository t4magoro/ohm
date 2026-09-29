type Props = { token: string; busy: boolean; onToken: (token: string) => void; onOpen: () => void };

/** The admin token, typed like a terminal password. It lives only in memory: gone when you close the tab. */
export function LoginForm({ token, busy, onToken, onOpen }: Props) {
  return (
    <form
      className="term flex max-w-md items-center gap-2 px-3 py-1.5"
      onSubmit={(e) => {
        e.preventDefault();
        onOpen();
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
        onChange={(e) => onToken(e.target.value)}
        className="term-input"
      />
      <button className="term-btn" disabled={!token || busy}>
        [open]
      </button>
    </form>
  );
}
