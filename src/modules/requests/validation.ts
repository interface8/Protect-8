import { z } from "zod";

export const requestStatusSchema = z.enum([
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

export const createRequestSchema = z.object({
  lawyerProfileId: z.string().min(1).optional(),
  category: z.string().min(2, "Category is required"),
  title: z.string().min(3, "Title is required"),
  description: z.string().trim().max(4000).optional().nullable(),
});

export const updateRequestSchema = z
  .object({
    category: z.string().min(2).optional(),
    title: z.string().min(3).optional(),
    description: z.string().trim().max(4000).optional().nullable(),
    status: requestStatusSchema.optional(),
  })
  .refine(
    (data) =>
      data.category !== undefined ||
      data.title !== undefined ||
      data.description !== undefined ||
      data.status !== undefined,
    {
      message: "Provide at least one field to update",
    },
  );

export const requestFiltersSchema = z.object({
  citizenId: z.string().optional(),
  lawyerId: z.string().optional(),
  status: requestStatusSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const assignRequestSchema = z.object({
  lawyerProfileId: z.string().min(1, "Lawyer profile is required"),
});

export const transitionRequestStatusSchema = z.object({
  status: requestStatusSchema,
});