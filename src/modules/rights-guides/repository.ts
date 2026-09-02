import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { RightsGuideDto, RightsGuideListFilters } from "./types";

type RightsGuideRecord = {
  id: string;
  slug: string;
  title: string;
  iconKey: string;
  shortDescription: string;
  body: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function toRightsGuideDto(guide: RightsGuideRecord): RightsGuideDto {
  return {
    id: guide.id,
    slug: guide.slug,
    title: guide.title,
    iconKey: guide.iconKey,
    shortDescription: guide.shortDescription,
    body: guide.body,
    order: guide.order,
    isActive: guide.isActive,
    createdAt: guide.createdAt,
    updatedAt: guide.updatedAt,
  };
}

function buildSearchWhere(search?: string): Prisma.RightsGuideWhereInput {
  if (!search) {
    return { isActive: true };
  }

  const normalized = search.trim();

  return {
    isActive: true,
    OR: [
      { title: { contains: normalized, mode: "insensitive" } },
      { shortDescription: { contains: normalized, mode: "insensitive" } },
      { body: { contains: normalized, mode: "insensitive" } },
    ],
  };
}

export async function listRightsGuides(
  filters: RightsGuideListFilters = {},
): Promise<RightsGuideDto[]> {
  const guides = await prisma.rightsGuide.findMany({
    where: buildSearchWhere(filters.search),
    orderBy: [{ order: "asc" }, { title: "asc" }],
  });

  return guides.map((guide) => toRightsGuideDto(guide as RightsGuideRecord));
}

export async function findRightsGuideBySlug(
  slug: string,
): Promise<RightsGuideDto | null> {
  const guide = await prisma.rightsGuide.findUnique({
    where: { slug },
  });

  return guide ? toRightsGuideDto(guide as RightsGuideRecord) : null;
}