import type { Metadata } from "next";
import type { ReactNode } from "react";

// The browser tab's title. The page itself is a client component, and those can't export metadata.
export const metadata: Metadata = {
  title: "Vitals",
  description: "Ohm's milestones, spellbook, top words and charts, from live data.",
  alternates: { canonical: "/ohm/vitals" },
};

export default function VitalsLayout({ children }: { children: ReactNode }) {
  return children;
}
