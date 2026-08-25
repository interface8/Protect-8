import * as articleRepo from "./repository";
import type {
  ArticleDto,
  ArticleListFilters,
  CreateArticleInput,
  FlagArticleInput,
  UpdateArticleInput,
} from "./types";

export async function listArticles(filters: ArticleListFilters = {}) {
  return articleRepo.listArticles(filters);
}

export async function getArticleById(id: string): Promise<ArticleDto> {
  const article = await articleRepo.findArticleById(id);
  if (!article) {
    throw new Error("Article not found");
  }
  return article;
}

export async function getArticleBySlug(slug: string): Promise<ArticleDto> {
  const article = await articleRepo.findArticleBySlug(slug);
  if (!article) {
    throw new Error("Article not found");
  }
  return article;
}

export async function createArticle(
  input: CreateArticleInput,
  actorId: string,
) {
  const existing = await articleRepo.findArticleBySlug(input.slug);
  if (existing) {
    throw new Error("Article slug already exists");
  }

  return articleRepo.createArticle(input, actorId);
}

export async function updateArticle(
  id: string,
  input: UpdateArticleInput,
  actorId: string,
) {
  const existing = await articleRepo.findArticleById(id);
  if (!existing) {
    throw new Error("Article not found");
  }

  return articleRepo.updateArticle(id, input, actorId);
}

export async function flagArticle(
  id: string,
  actorId: string,
  input: FlagArticleInput,
) {
  const existing = await articleRepo.findArticleById(id);
  if (!existing) {
    throw new Error("Article not found");
  }

  return articleRepo.flagArticle(id, actorId, input);
}