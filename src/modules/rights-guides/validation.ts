import { z } from "zod";

export const rightsGuideListQuerySchema = z.object({
  search: z.string().trim().optional(),
});