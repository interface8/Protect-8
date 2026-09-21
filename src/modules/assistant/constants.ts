export const ASSISTANT_DISCLOSURE =
  "This is informational guidance, not legal counsel. For urgent danger, contact emergency services or use the emergency request flow.";

export const ASSISTANT_GREETING =
  "I’m here to help you understand your options and next steps. Tell me what happened, and I’ll give you general information you can use right away.";

export const ASSISTANT_MODEL =
  process.env.GEMINI_MODEL?.trim() || "gemini-3.6-flash";

export const ASSISTANT_QUICK_REPLIES = [
  {
    id: "traffic-stop",
    label: "I've been stopped by police",
    message: "I've been stopped by police.",
    category: "traffic_stop",
  },
  {
    id: "efcc-invitation",
    label: "I received an EFCC invitation",
    message: "I received an EFCC invitation.",
    category: "efcc_invitation",
  },
  {
    id: "arrest",
    label: "I'm being arrested",
    message: "I'm being arrested.",
    category: "police_arrest",
  },
  {
    id: "land-dispute",
    label: "I have a land dispute",
    message: "I have a land dispute.",
    category: "land_dispute",
  },
  {
    id: "something-else",
    label: "Something else",
    message: "Something else.",
    category: "something_else",
  },
] as const;

export const ASSISTANT_CATEGORIES = [
  "traffic_stop",
  "police_arrest",
  "efcc_invitation",
  "land_dispute",
  "domestic_violence",
  "employment_matter",
  "something_else",
] as const;

export const ASSISTANT_HISTORY_LIMIT = 10;