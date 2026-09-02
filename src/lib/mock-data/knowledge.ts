import { Article, KnowledgeCategory } from "@/types/knowledge";

export const mockArticles: Article[] = [
  {
    id: "1",
    slug: "what-should-i-do-during-an-arrest",
    title: "What should I do during an arrest?",
    excerpt:
      "Being arrested is a stressful and confusing experience. Understanding your rights and the proper steps can help protect you.",
    body: "Full article content about what to do during an arrest...",
    category: KnowledgeCategory.CRIMINAL_RIGHTS,
    readTimeMinutes: 4,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    slug: "can-police-search-my-phone",
    title: "Can police search my phone?",
    excerpt:
      "Your smartphone contains a vast amount of personal information. Learn when police can legally access your device.",
    body: "Full article content about phone searches...",
    category: KnowledgeCategory.PRIVACY_RIGHTS,
    readTimeMinutes: 3,
    createdAt: "2024-01-20T10:00:00Z",
  },
  {
    id: "3",
    slug: "what-are-my-tenant-rights",
    title: "What are my tenant rights?",
    excerpt:
      "As a tenant, you have significant legal protections. Landlords cannot simply evict you without proper cause.",
    body: "Full article content about tenant rights...",
    category: KnowledgeCategory.PROPERTY_LAW,
    readTimeMinutes: 5,
    createdAt: "2024-02-01T10:00:00Z",
  },
  {
    id: "4",
    slug: "how-do-i-report-fraud",
    title: "How do I report fraud?",
    excerpt:
      "If you have been a victim of fraud, you have several reporting options in Nigeria.",
    body: "Full article content about reporting fraud...",
    category: KnowledgeCategory.FINANCIAL_CRIME,
    readTimeMinutes: 4,
    createdAt: "2024-02-10T10:00:00Z",
  },
  {
    id: "5",
    slug: "understanding-efcc-invitations",
    title: "Understanding EFCC invitations",
    excerpt:
      "Receiving an EFCC invitation does not mean you are guilty of anything. It simply means you are required to provide information.",
    body: "Full article content about EFCC invitations...",
    category: KnowledgeCategory.FINANCIAL_CRIME,
    readTimeMinutes: 6,
    createdAt: "2024-02-15T10:00:00Z",
  },
  {
    id: "6",
    slug: "vehicle-seizure-your-rights",
    title: "Vehicle seizure: your rights",
    excerpt:
      "If your vehicle has been seized by authorities, there are defined legal procedures that must be followed.",
    body: "Full article content about vehicle seizure...",
    category: KnowledgeCategory.TRAFFIC_LAW,
    readTimeMinutes: 3,
    createdAt: "2024-03-01T10:00:00Z",
  },
];