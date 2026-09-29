import { PixelArt } from "./pixel/PixelArt";

export type Tab = "status" | "chat" | "feed" | "book";

// 7 × 6 icons. Placeholders: redraw them!
const TABS: { id: Tab; label: string; icon: string[] }[] = [
  { id: "status", label: "status", icon: [".pp.pp.", "ppppppp", "ppppppp", ".ppppp.", "..ppp..", "...p..."] },
  { id: "chat", label: "chat", icon: [".wwwww.", "wwwwwww", "wkwkwkw", "wwwwwww", ".ww....", "w......"] },
  { id: "feed", label: "feed", icon: ["y.yyyyy", ".......", "y.yyyy.", ".......", "y.yyyyy", "......."] },
  { id: "book", label: "book", icon: [".vvvvvv", "vllllll", "vlVVVVl", "vllllll", "vlVVVll", ".vvvvvv"] },
];

type Props = {
  tab: Tab;
  onTab: (tab: Tab) => void;
  /** A dot on a tab: "news" (pink) for new lines, "alert" (red) when Ohm needs help. */
  dots: Partial<Record<Tab, "news" | "alert">>;
  className?: string;
};

/** The phone's bottom bar, like a game's menu. Tabs switch instantly: they're equals, not a journey. */
export function TabBar({ tab, onTab, dots, className = "" }: Props) {
  return (
    <nav aria-label="Panels" className={`grid grid-cols-4 border-t-[3px] border-line bg-screen pb-[env(safe-area-inset-bottom)] ${className}`}>
      {TABS.map((t) => {
        const on = t.id === tab;
        return (
          <button
            key={t.id}
            type="button"
            aria-pressed={on}
            onClick={() => onTab(t.id)}
            className={`flex h-14 flex-col items-center justify-center gap-1.5 border-t-[3px] ${on ? "border-pink bg-card text-text" : "border-transparent text-dim"}`}
          >
            <span className="relative">
              <PixelArt art={t.icon} className={`h-4 w-auto ${on ? "" : "opacity-50"}`} />
              {dots[t.id] && (
                <span className={`absolute -right-2 -top-1 size-2 ${dots[t.id] === "alert" ? "bg-danger" : "bg-pink"}`}>
                  <span className="sr-only">{dots[t.id] === "alert" ? "(needs help)" : "(new)"}</span>
                </span>
              )}
            </span>
            <span className="font-pixel text-[10px]">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
