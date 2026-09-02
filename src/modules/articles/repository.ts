import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
  ArticleDto,
  ArticleListFilters,
  CreateArticleInput,
  FlagArticleInput,
  UpdateArticleInput,
} from "./types";

const articleWithUsers = {
  include: {
    createdBy: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    updatedBy: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    flaggedBy: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  },
} as const;

type ArticleRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category:
    | "CRIMINAL_RIGHTS"
    | "PRIVACY_RIGHTS"
    | "PROPERTY_LAW"
    | "FINANCIAL_CRIME"
    | "TRAFFIC_LAW";
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
};

function toArticleDto(article: ArticleRecord): ArticleDto {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    body: article.body,
    category: article.category,
    readTimeMinutes: article.readTimeMinutes,
    isPublished: article.isPublished,
    isFlagged: article.isFlagged,
    flagReason: article.flagReason,
    flaggedAt: article.flaggedAt,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    createdBy: article.createdBy,
    updatedBy: article.updatedBy,
    flaggedBy: article.flaggedBy,
  };
}

function buildWhere(filters: ArticleListFilters): Prisma.ArticleWhereInput {
  const where: Prisma.ArticleWhereInput = {};

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.search) {
    const search = filters.search.trim();

    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { excerpt: { contains: search, mode: "insensitive" } },
      { body: { contains: search, mode: "insensitive" } },
    ];
  }

  return where;
}

export async function listArticles(
  filters: ArticleListFilters = {},
): Promise<ArticleDto[]> {
  const articles = await prisma.article.findMany({
    where: buildWhere(filters),
    orderBy: [{ createdAt: "desc" }],
    ...articleWithUsers,
  });

  return articles.map((article) => toArticleDto(article as ArticleRecord));
}

export async function findArticleById(id: string): Promise<ArticleDto | null> {
  const article = await prisma.article.findUnique({
    where: { id },
    ...articleWithUsers,
  });

  return article ? toArticleDto(article as ArticleRecord) : null;
}

export async function findArticleBySlug(
  slug: string,
): Promise<ArticleDto | null> {
  const article = await prisma.article.findUnique({
    where: { slug },
    ...articleWithUsers,
  });

  return article ? toArticleDto(article as ArticleRecord) : null;
}

export async function createArticle(
  input: CreateArticleInput,
  actorId: string,
): Promise<ArticleDto> {
  const article = await prisma.article.create({
    data: {
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      body: input.body,
      category: input.category,
      readTimeMinutes: input.readTimeMinutes,
      isPublished: input.isPublished ?? true,
      createdById: actorId,
      updatedById: actorId,
    },
    ...articleWithUsers,
  });

  return toArticleDto(article as ArticleRecord);
}

export async function updateArticle(
  id: string,
  input: UpdateArticleInput,
  actorId: string,
): Promise<ArticleDto> {
  const data: Prisma.ArticleUpdateInput = {
    updatedBy: {
      connect: { id: actorId },
    },
  };

  if (input.slug !== undefined) data.slug = input.slug;
  if (input.title !== undefined) data.title = input.title;
  if (input.excerpt !== undefined) data.excerpt = input.excerpt;
  if (input.body !== undefined) data.body = input.body;
  if (input.category !== undefined) data.category = input.category;
  if (input.readTimeMinutes !== undefined) data.readTimeMinutes = input.readTimeMinutes;
  if (input.isPublished !== undefined) data.isPublished = input.isPublished;

  const article = await prisma.article.update({
    where: { id },
    data,
    ...articleWithUsers,
  });

  return toArticleDto(article as ArticleRecord);
}

export async function flagArticle(
  id: string,
  actorId: string,
  input: FlagArticleInput,
): Promise<ArticleDto> {
  const article = await prisma.article.update({
    where: { id },
    data: {
      isFlagged: input.isFlagged,
      flagReason: input.isFlagged ? input.flagReason ?? null : null,
      flaggedAt: input.isFlagged ? new Date() : null,
      flaggedBy: {
        connect: { id: actorId },
      },
      updatedBy: {
        connect: { id: actorId },
      },
    },
    ...articleWithUsers,
  });

  return toArticleDto(article as ArticleRecord);
}