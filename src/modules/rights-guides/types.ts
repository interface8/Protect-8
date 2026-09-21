export interface RightsGuideDto {
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
}

export interface RightsGuideDetailDto extends RightsGuideDto {
  disclosure: string;
}

export interface RightsGuideListFilters {
  search?: string;
}

export const RIGHTS_GUIDE_DISCLOSURE =
  "This guide is for general informational purposes only and does not create a lawyer-client relationship or replace legal advice from a qualified lawyer.";