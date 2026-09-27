const EMOJI_BY_ICON_KEY: Record<string, string> = {
  "traffic-stop": "🚗",
  "police-arrest": "⚖️",
  "efcc-issue": "🏛️",
  "land-dispute": "🏡",
  "domestic-violence": "🛡️",
  "security-agency": "🔒",
  "employment-matter": "💼",
  fraud: "⚠️",
  cybercrime: "💻",
  immigration: "✈️",
  other: "📋",
};

export function getCategoryEmoji(iconKey: string): string {
  return EMOJI_BY_ICON_KEY[iconKey] ?? "📋";
}