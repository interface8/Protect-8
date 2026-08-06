import { z } from "zod";

const emailSchema = z.string().email("Invalid email address");
const phoneSchema = z
  .string()
  .min(7, "Phone number is too short")
  .max(20, "Phone number is too long");

const contactFields = {
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
};

const createBaseSchema = z.object({
  ...contactFields,
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  roleId: z.string().min(1, "Role is required"),
  isActive: z.boolean().optional(),
  authProvider: z.string().optional().nullable(),
  providerId: z.string().optional().nullable(),
});

const updateBaseSchema = z.object({
  ...contactFields,
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  roleId: z.string().min(1, "Role is required").optional(),
  isActive: z.boolean().optional(),
  authProvider: z.string().optional().nullable(),
  providerId: z.string().optional().nullable(),
});

export const createUserSchema = createBaseSchema
  .refine((data) => data.email || data.phone, {
    message: "Provide either email or phone",
    path: ["email"],
  })
  .refine((data) => !(data.email && data.phone), {
    message: "Use either email or phone, not both",
    path: ["phone"],
  });

export const updateUserSchema = updateBaseSchema
  .refine((data) => !(data.email && data.phone), {
    message: "Use either email or phone, not both",
    path: ["phone"],
  });

export const userFiltersSchema = z.object({
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  roleId: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});
