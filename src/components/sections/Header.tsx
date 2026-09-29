import Link from "next/link";

/** The top bar: Ohm's name, whether you're connected, and the way to the Vitals page. */
export function Header({ connected, connection }: { connected: boolean; connection: string }) {
  return (
    <header className="col-start-1 row-start-1 flex items-center gap-3 px-4 pt-3 lg:p-0">
      <div>
        <h1 className="title-outline font-pixel text-3xl font-bold leading-none lg:text-5xl">OHM</h1>
        <p className="mt-1 hidden text-foreground/80 lg:block">the internet&apos;s robot pet</p>
      </div>
      <p className="ml-auto flex items-center gap-1.5 whitespace-nowrap">
        <span className={`size-2 ${connected ? "bg-mint" : "bg-danger"}`} />
        {connection}
      </p>
      <Link href="/vitals" className="btn">
        vitals
      </Link>
    </header>
  );
}
