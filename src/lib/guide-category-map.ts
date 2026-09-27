const GUIDE_TO_CATEGORY_KEY: Record<string, string> = {
  "traffic-stop": "traffic-stop",
  "police-arrest": "police-arrest",
  "efcc-issue": "efcc-issue",
  "land-dispute": "land-dispute",
  "domestic-violence": "domestic-violence",
  "employment-matter": "employment-matter",
  "security-agency": "security-agency",
  fraud: "fraud",
  cybercrime: "cybercrime",
  immigration: "immigration",
  other: "other",
};

export function getCategoryKeyForGuideSlug(slug: string): string {
  return GUIDE_TO_CATEGORY_KEY[slug] ?? slug;
}
