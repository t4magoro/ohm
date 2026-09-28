import type { Metadata } from "next";
import type { ReactNode } from "react";

// Keeps the admin page out of search engines. It's still reachable by URL: the token is the lock.
export const metadata: Metadata = {
  title: "Ohm admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}