// About Ohm: the welcome for first-time visitors, and the footer (what Ohm keeps about you, whose data it uses).

/** Shown once, in the banner at the top, when your browser has no visit on record. */
export const WELCOME =
  "Hi! I'm Ohm, one robot pet shared by everyone online. Charge me, play with me, and talk to me: I write my own replies, and I learn new words from yours.";

export const PRIVACY =
  "Privacy: no accounts. Your browser keeps a random visitor ID (so Ohm can tell people on one Wi-Fi apart) and your name.";

export const WEATHER_SOURCE = { name: "Open-Meteo.com", href: "https://open-meteo.com/" };

export const WORD_LISTS = [
  { name: "FrequencyWords", href: "https://github.com/hermitdave/FrequencyWords", license: "CC BY-SA 4.0" },
  {
    name: "LDNOOBW",
    href: "https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words",
    license: "CC BY 4.0",
  },
];

/** Where his replies come from (ohm-api/src/model.bin): a small network trained on example chats this model wrote. */
export const REPLY_TEACHER = { name: "Qwen3-8B", href: "https://huggingface.co/Qwen/Qwen3-8B", license: "Apache 2.0" };

/** The word patterns behind his guessing skill (ohm-api/src/base.bin): Tatoeba's sentences, crediting every author. */
export const WORD_PATTERNS = {
  name: "Tatoeba",
  href: "https://tatoeba.org",
  license: "CC BY 2.0 FR",
  credits: "https://github.com/t4magoro/ohm-api/blob/main/CREDITS.md",
  authors: 191,
};
