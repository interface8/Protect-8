import { z } from "zod";

export const knowledgeCenterCategorySchema = z.enum([
  "CRIMINAL_RIGHTS",
  "PRIVACY_RIGHTS",
  "PROPERTY_LAW",
  "FINANCIAL_CRIME",
  "TRAFFIC_LAW",
]);

export const articleListQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: knowledgeCenterCategorySchema.optional(),
});

export const createArticleSchema = z.object({
  slug: z.string().trim().min(2).max(120),
  title: z.string().trim().min(2).max(200),
  excerpt: z.string().trim().min(10).max(500),
  body: z.string().trim().min(20),
  category: knowledgeCenterCategorySchema,
  readTimeMinutes: z.coerce.number().int().min(1).max(120),
  isPublished: z.coerce.boolean().optional(),
});

export const updateArticleSchema = z
  .object({
    slug: z.string().trim().min(2).max(120).optional(),
    title: z.string().trim().min(2).max(200).optional(),
    excerpt: z.string().trim().min(10).max(500).optional(),
    body: z.string().trim().min(20).optional(),
    category: knowledgeCenterCategorySchema.optional(),
    readTimeMinutes: z.coerce.number().int().min(1).max(120).optional(),
    isPublished: z.coerce.boolean().optional(),
  })
  .refine(
    (data) =>
      data.slug !== undefined ||
      data.title !== undefined ||
      data.excerpt !== undefined ||
      data.body !== undefined ||
      data.category !== undefined ||
      data.readTimeMinutes !== undefined ||
      data.isPublished !== undefined,
    {
      message: "Provide at least one field to update",
    },
  );

export const flagArticleSchema = z.object({
  isFlagged: z.boolean(),
  flagReason: z.string().trim().max(500).nullable().optional(),
});