import type { Metadata } from "next";
import type { ReactNode } from "react";

// The browser tab's title. The page itself is a client component, and those can't export metadata.
export const metadata: Metadata = {
  title: "Ohm's vitals",
};

export default function VitalsLayout({ children }: { children: ReactNode }) {
  return children;
}
