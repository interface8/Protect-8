export type KnowledgeCenterCategory =
  | "CRIMINAL_RIGHTS"
  | "PRIVACY_RIGHTS"
  | "PROPERTY_LAW"
  | "FINANCIAL_CRIME"
  | "TRAFFIC_LAW";

export interface ArticleDto {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: KnowledgeCenterCategory;
  readTimeMinutes: number;
  isPublished: boolean;
  isFlagged: boolean;
  flagReason: string | null;
  flaggedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: {
    id: string;
    name: string;
    email: string | null;
  };
  updatedBy: {
    id: string;
    name: string;
    email: string | null;
  } | null;
  flaggedBy: {
    id: string;
    name: string;
    email: string | null;
  } | null;
}

export interface ArticleListFilters {
  search?: string;
  category?: KnowledgeCenterCategory;
}

export interface CreateArticleInput {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: KnowledgeCenterCategory;
  readTimeMinutes: number;
  isPublished?: boolean;
}

export interface UpdateArticleInput {
  slug?: string;
  title?: string;
  excerpt?: string;
  body?: string;
  category?: KnowledgeCenterCategory;
  readTimeMinutes?: number;
  isPublished?: boolean;
}

export interface FlagArticleInput {
  isFlagged: boolean;
  flagReason?: string | null;
}