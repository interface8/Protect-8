export enum KnowledgeCategory {
  CRIMINAL_RIGHTS = "CRIMINAL_RIGHTS",
  PRIVACY_RIGHTS = "PRIVACY_RIGHTS",
  PROPERTY_LAW = "PROPERTY_LAW",
  FINANCIAL_CRIME = "FINANCIAL_CRIME",
  TRAFFIC_LAW = "TRAFFIC_LAW",
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: KnowledgeCategory;
  readTimeMinutes: number;
  createdAt: string;
}

export const categoryDisplayMap: Record<KnowledgeCategory, string> = {
  [KnowledgeCategory.CRIMINAL_RIGHTS]: "Criminal Rights",
  [KnowledgeCategory.PRIVACY_RIGHTS]: "Privacy Rights",
  [KnowledgeCategory.PROPERTY_LAW]: "Property Law",
  [KnowledgeCategory.FINANCIAL_CRIME]: "Financial Crime",
  [KnowledgeCategory.TRAFFIC_LAW]: "Traffic Law",
};

export const categoryColorMap: Record<KnowledgeCategory, string> = {
  [KnowledgeCategory.CRIMINAL_RIGHTS]: "#ef4444",
  [KnowledgeCategory.PRIVACY_RIGHTS]: "#8b5cf6",
  [KnowledgeCategory.PROPERTY_LAW]: "#10b981",
  [KnowledgeCategory.FINANCIAL_CRIME]: "#eab308",
  [KnowledgeCategory.TRAFFIC_LAW]: "#3b82f6",
};