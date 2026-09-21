export type LawyerVerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface LawyerProfileDto {
  id: string;
  userId: string;
  barEnrollmentNumber: string;
  practiceLicenseUrl: string;
  idDocumentUrl: string;
  practiceAreas: string[];
  languages: string[];
  yearsOfExperience: number;
  verificationStatus: LawyerVerificationStatus;
  isMatchable: boolean;
  rejectionReason: string | null;
  reviewedById: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    role: {
      id: string;
      name: string;
    };
  };
}

export interface SubmitLawyerOnboardingInput {
  barEnrollmentNumber: string;
  practiceLicenseUrl: string;
  idDocumentUrl: string;
  practiceAreas: string[];
  languages: string[];
  yearsOfExperience: number;
}

export interface LawyerReviewInput {
  reason?: string;
}

export interface LawyerListFilters {
  status?: LawyerVerificationStatus | "all";
  page?: number;
  limit?: number;
}

export interface PaginatedLawyerResult {
  data: LawyerProfileDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}