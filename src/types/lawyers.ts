export interface Lawyer {
  id: string;
  name: string;
  verified: boolean;
  avatar: string | null;
  availabilityStatus: "AVAILABLE" | "BUSY" | "OFFLINE";
  practiceArea: string;
  specialtyTags: string[];
  rating: number;
  ratingCount: number;
  consultationFee: number;
  responseTimeEstimate: string;
  location: string | null;
}

export interface LawyerDetail extends Lawyer {
  yearsOfExperience: number;
  barMembership: string;
  languages: string[];
}