export type RatingRaterType = "CITIZEN" | "LAWYER";

export interface RequestRatingDto {
  id: string;
  requestId: string;
  raterUserId: string;
  raterType: RatingRaterType;
  targetUserId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubmitRequestRatingInput {
  requestId: string;
  raterUserId: string;
  raterType: RatingRaterType;
  targetUserId: string;
  rating: number;
  comment?: string | null;
}