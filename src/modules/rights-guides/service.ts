import * as rightsGuideRepo from "./repository";
import {
  RIGHTS_GUIDE_DISCLOSURE,
  type RightsGuideDetailDto,
  type RightsGuideListFilters,
} from "./types";

export async function listRightsGuides(filters: RightsGuideListFilters = {}) {
  return rightsGuideRepo.listRightsGuides(filters);
}

export async function getRightsGuideBySlug(
  slug: string,
): Promise<RightsGuideDetailDto> {
  const guide = await rightsGuideRepo.findRightsGuideBySlug(slug);

  if (!guide) {
    throw new Error("Rights guide not found");
  }

  return {
    ...guide,
    disclosure: RIGHTS_GUIDE_DISCLOSURE,
  };
}