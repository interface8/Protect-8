export interface Lawyer {
  id: string;
  slug: string;
  name: string;
  specialty: string;
  subSpecialties: string[];
  rating: number;
  reviews: number;
  price: number;
  responseTime: string;
  availability: boolean;
  avatar?: string; // NEW: optional avatar URL
}

export interface LawyerDetail extends Lawyer {
  experience: number;
  location: string;
  barNumber: string;
  languages: string[];
  about: string;
  practiceAreas: string[];
  avatar?: string; // NEW: optional avatar URL
}