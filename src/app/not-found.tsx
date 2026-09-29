import type { Metadata } from "next";
import Link from "next/link";
import { OhmSprite } from "@/components/pixel/OhmSprite";

export const metadata: Metadata = { title: "Page not found" };

// Becomes out/404.html. GitHub Pages shows it for any unknown address under /ohm/.
export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-4 py-6">
      <h1 className="title-outline font-pixel text-5xl font-bold leading-none">404</h1>
      <OhmSprite face="off" parts={[]} className="h-40 w-auto" />
      <section className="term w-full">
        <h2 className="term-bar">
          <span>error</span>
        </h2>
        <div className="p-3">
          <p>$ open this page</p>
          <p>not found. Ohm never learned this address.</p>
        </div>
      </section>
      <Link href="/" className="btn">
        back to ohm
      </Link>
    </main>
  );
}