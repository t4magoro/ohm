import type { Metadata, Viewport } from "next";
import { Silkscreen, VT323 } from "next/font/google";
import "./globals.css";

// Silkscreen (the portfolio's pixel font) for titles and labels,
// VT323 (an old terminal font) for everything you read and type.
const silk = Silkscreen({
  variable: "--font-silk",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const term = VT323({
  variable: "--font-term",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Ohm",
  description: "The internet's robot pet",
};

// The phone layout fills the screen exactly (h-dvh), so:
// - resizes-content: when the keyboard opens (Android), the page shrinks instead of hiding the chat box.
// - cover: the page may use the whole screen; the tab bar keeps clear of the home bar with safe-area padding.
export const viewport: Viewport = {
  interactiveWidget: "resizes-content",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${silk.variable} ${term.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
