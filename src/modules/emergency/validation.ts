import { z } from "zod";

export const createEmergencyCategorySchema = z.object({
  key: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Key must be kebab-case"),
  label: z.string().trim().min(2).max(100),
  iconKey: z.string().trim().min(1).max(100),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const updateEmergencyCategorySchema = z
  .object({
    key: z
      .string()
      .trim()
      .min(2)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Key must be kebab-case")
      .optional(),
    label: z.string().trim().min(2).max(100).optional(),
    iconKey: z.string().trim().min(1).max(100).optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.coerce.number().int().min(0).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update",
  });

export const createEmergencyRequestSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  message: z.string().trim().max(4000).optional().nullable(),
  location: z.string().trim().max(500).optional().nullable(),
  preferredLanguage: z.string().trim().max(80).optional().nullable(),
  locationConsent: z.boolean().optional().default(false),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
}).refine(
  (value) =>
    (value.latitude == null && value.longitude == null) ||
    (value.latitude != null && value.longitude != null),
  { message: "Latitude and longitude must be provided together" },
);

export const emergencyRequestStatusSchema = z.object({
  status: z.enum([
    "REQUESTED",
    "MATCHED",
    "ACCEPTED",
    "REJECTED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
  ]),
});

export const sosTriggerSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  message: z.string().trim().max(4000).optional().nullable(),
  location: z.string().trim().max(500).optional().nullable(),
  preferredLanguage: z.string().trim().max(80).optional().nullable(),
  locationConsent: z.boolean(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
}).refine(
  (value) =>
    !value.locationConsent ||
    (value.latitude != null && value.longitude != null),
  { message: "GPS coordinates are required when consent is given" },
);
