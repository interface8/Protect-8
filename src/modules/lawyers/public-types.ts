export const PUBLIC_LAWYER_FILTERS = [
  "available",
  "criminal",
  "property",
  "employment",
  "family",
  "civil",
] as const;

export type PublicLawyerFilter =
  (typeof PUBLIC_LAWYER_FILTERS)[number];

export type PublicAvailabilityStatus =
  "AVAILABLE" | "BUSY" | "OFFLINE";

export interface PublicLawyer {
  id: string;
  name: string;
  verified: boolean;
  avatar: string | null;
  availabilityStatus: PublicAvailabilityStatus;
  practiceArea: string;
  specialtyTags: string[];
  rating: number;
  ratingCount: number;
  consultationFee: number;
  responseTimeEstimate: string;
}

export interface PublicLawyerDetail extends PublicLawyer {
  yearsOfExperience: number;
  barMembership: string;
  languages: string[];
}

export interface PublicLawyerListInput {
  search?: string;
  filter?: PublicLawyerFilter;
  page: number;
  limit: number;
}

export interface PublicLawyerListResult {
  data: PublicLawyer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  availableNowCount: number;
}

export interface AvailableLawyerResult {
  data: PublicLawyer[];
  count: number;
}
