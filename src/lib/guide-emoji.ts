const EMOJI_BY_KEYWORD: [string, string][] = [
  ["traffic", "🚗"],
  ["arrest", "⚖️"],
  ["efcc", "🏛️"],
  ["land", "🏡"],
  ["domestic", "🛡️"],
  ["employment", "💼"],
];

export function getGuideEmoji(title: string): string | null {
  const t = title.toLowerCase();
  return EMOJI_BY_KEYWORD.find(([keyword]) => t.includes(keyword))?.[1] ?? null;
}