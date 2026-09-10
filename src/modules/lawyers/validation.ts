import { z } from "zod";
import { PUBLIC_LAWYER_FILTERS } from "./public-types";

export const lawyerVerificationStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const submitLawyerOnboardingSchema = z.object({
  barEnrollmentNumber: z
    .string()
    .min(3, "Bar enrollment number is too short"),
  practiceLicenseUrl: z.string().url("Practice license must be a valid URL"),
  idDocumentUrl: z.string().url("ID document must be a valid URL"),
  practiceAreas: z
    .array(z.string().min(2, "Practice area is too short"))
    .min(1, "At least one practice area is required"),
  languages: z
    .array(z.string().min(2, "Language is too short"))
    .min(1, "At least one language is required"),
  yearsOfExperience: z
    .number()
    .int("Years of experience must be a whole number")
    .min(0, "Years of experience cannot be negative"),
});

export const updateLawyerOnboardingSchema = submitLawyerOnboardingSchema.partial();

export const lawyerListFiltersSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "all"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const rejectLawyerSchema = z.object({
  reason: z.string().min(3, "Rejection reason is required"),
});

export const publicLawyerFilterSchema = z.enum(PUBLIC_LAWYER_FILTERS);

export const publicLawyerQuerySchema = z.object({
  search: z.string().trim().optional(),
  filter: publicLawyerFilterSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
});

export const availableLawyerQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(20).default(4),
});

export const lawyerAvailabilitySchema = z.object({
  availabilityStatus: z.enum(["AVAILABLE", "BUSY", "OFFLINE"]),
});
