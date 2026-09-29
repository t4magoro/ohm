// How the status card describes Bandung's weather: [text, color]. Colors are Tailwind text classes.

export const WEATHER_TEXT = {
  temp: (tempC: number) => `${Math.round(tempC)}°C in Bandung`,
  night: [
    ["night: Ohm sleeps, poke it to wake it up", "text-lilac"],
    ["everything drains at half speed", "text-mint"],
  ],
  hot: ["hot: the battery drains faster", "text-danger"],
  rain: ["rain: Ohm's mood drains faster", "text-danger"],
  calm: ["a calm day", "text-mint"],
  off: ["powered off: press reboot", "text-danger"],
} as const;
