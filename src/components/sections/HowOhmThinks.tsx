import type { ReactNode } from "react";

// "[+] how ohm thinks" for a reply brain v4 wrote: the whole path from your message to his reply as a flowchart, one
// short line a box. Every box matches ohm-api (talk.ts, gen.ts); the numbers are its settings (8 replies, top 95%,
// 3 to 5 people, a guard of about 5% per word).
const LABEL = "font-pixel text-[10px] uppercase tracking-wide text-lemon";

function Box({ k, children, tone = "border-edge" }: { k: string; children: ReactNode; tone?: string }) {
  return (
    <div className={`border-2 ${tone} bg-card px-2.5 py-1.5`}>
      <p className={LABEL}>{k}</p>
      <div className="leading-snug text-text">{children}</div>
    </div>
  );
}
const Down = () => (
  <p aria-hidden className="py-0.5 text-center leading-none text-dim">
    ▼
  </p>
);
const STRIPES = "bg-[repeating-linear-gradient(90deg,var(--color-pink)_0_2px,transparent_2px_5px)]";

export function HowOhmThinks() {
  return (
    <div className="mt-2">
      <Box k="1 · you say something">your message, up to 20 words</Box>
      <Down />
      <Box k="2 · he reads">
        <span className="flex flex-wrap gap-1 pt-0.5 text-base">
          {["your words", "battery", "mood", "weather", "time of day", "his last line to you"].map((x) => (
            <span key={x} className="border border-edge px-1">
              {x}
            </span>
          ))}
        </span>
      </Box>
      <Down />
      <Box k="3 · he writes 8 replies at once">
        one word at a time, each reply with its own dice
        <span aria-hidden className="mt-1 grid grid-cols-8 gap-1">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className="flex flex-col gap-0.5">
              {Array.from({ length: 3 + (i % 3) }, (_, j) => (
                <span key={j} className="h-1 bg-mint/60" />
              ))}
            </span>
          ))}
        </span>
      </Box>
      <Down />
      <Box k="4 · for every word" tone="border-mint">
        every word he can say gets a slice as wide as its chance. He skips the unlikely last 5% and rolls the die.
        <span aria-hidden className="relative mt-1.5 flex h-3">
          <span className="w-[46%] bg-mint" />
          <span className="w-[22%] bg-edge" />
          <span className="w-[14%] bg-[#2c3352]" />
          <span className="w-[13%] bg-edge" />
          <span className={`w-[5%] ${STRIPES}`} />
          <span className="absolute -top-1.5 left-[20%] size-2 bg-lemon" />
        </span>
      </Box>
      <div className="ml-6 border-l-2 border-dashed border-lemon py-1 pl-3 text-base text-lemon">
        if 3 or more people taught him a word new to his network, what they said after it gets a bigger slice: more people, bigger, up to 5
      </div>
      <Box k="5 · he checks the 8">long copies of his example chats are set aside, unless all 8 are copies</Box>
      <Down />
      <Box k="6 · sure enough?" tone="border-lemon">
        he takes the reply he was surest of. Are its words at least about 5% likely, on average?
        <span className="mt-1 grid grid-cols-2 gap-2 text-base">
          <span className="border-2 border-mint px-1.5 text-mint">yes → he says it</span>
          <span className="border-2 border-pink px-1.5 text-pink">no → &quot;I don&apos;t know yet&quot;</span>
        </span>
      </Box>
      <p className="pt-2 text-base text-dim">He learned to talk from thousands of example chats written for him, and keeps learning from you.</p>
    </div>
  );
}
