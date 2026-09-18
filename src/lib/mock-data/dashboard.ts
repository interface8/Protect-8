// Navigation - Static (Sidebar)
export const navItems = [
  { name: "Home", href: "/dashboard", icon: "Home" },
  { name: "Know Your Rights", href: "/know-your-rights", icon: "BookOpen" },
  { name: "Find a Lawyer", href: "/find-a-lawyer", icon: "Scale" },
  { name: "AI Assistant", href: "/ai-assistant", icon: "Bot" },
  { name: "Knowledge Center", href: "/knowledge-center", icon: "Library" },
];

// Quick Access - Static (Dashboard homepage)
export const quickAccessItems = [
  {
    title: "Know Your Rights",
    description: "Guides for 6 scenarios",
    icon: "BookOpen",
    href: "/know-your-rights",
  },
  {
    title: "Find a Lawyer",
    description: "1,200+ verified lawyers",
    icon: "Scale",
    href: "/find-a-lawyer",
  },
  {
    title: "AI Assistant",
    description: "Get instant guidance",
    icon: "MessagesSquare",
    href: "/ai-assistant",
  },
];

// User Data - Will come from API (/api/user) later
export const userData = {
  id: "user_1",
  name: "Chukwuemeka",
  email: "chukwuemeka@protect8.dev",
  role: "citizen",
  trialDaysRemaining: 7,
};

// Helper function to get avatar initials from name
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Platform Stats - Mock (Black container)
export const platformStats = [
  { value: "1,200+", label: "Verified Lawyers" },
  { value: "8,400+", label: "Cases Resolved" },
  { value: "<15s", label: "Avg Response" },
];