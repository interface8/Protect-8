import { z } from "zod";

export const submitRequestRatingSchema = z.object({
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  comment: z.string().trim().max(1000).nullable().optional(),
});