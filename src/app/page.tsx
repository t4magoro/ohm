"use client";

import { useEffect, useState } from "react";

type Hello = { message: string; cppSays: number };

export default function Home() {
  const [hello, setHello] = useState<Hello | null>(null);
  const [error, setError] = useState<string | null>(null);

  // fetch only runs in the browser: the build pre-renders this page in Node.
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/hello`)
      .then((res) => {
        if (!res.ok) throw new Error(`API answered ${res.status}`);
        return res.json() as Promise<Hello>;
      })
      .then(setHello)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <main className="grid min-h-screen place-items-center p-6 font-mono">
      {error ? (
        <p className="text-red-600">Can&apos;t reach the API: {error}</p>
      ) : hello ? (
        <p>
          {hello.message} · C++ says 1 + 1 = {hello.cppSays}
        </p>
      ) : (
        <p>Connecting to Ohm…</p>
      )}
    </main>
  );
}