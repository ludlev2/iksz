export const REVIEW_CATEGORIES = [
  {
    key: 'usefulness',
    label: 'Mennyire érezted hasznosnak a munkádat?',
  },
  {
    key: 'difficulty',
    label: 'Mennyire volt megterhelő?',
  },
  {
    key: 'organization',
    label: 'Szervezettség',
  },
  {
    key: 'communication',
    label: 'Hatékony kommunikáció',
  },
  {
    key: 'learning',
    label: 'Mennyire érezted azt, hogy újat tanultál?',
  },
  {
    key: 'personalGrowth',
    label: 'Mennyire érezted, hogy személyesen fejlődtél?',
  },
] as const;

export type ReviewCategory = (typeof REVIEW_CATEGORIES)[number]['key'];

export interface ReviewRatingValue {
  key: string;
  label: string;
  value: number;
}

export interface OpportunityReview {
  id: string;
  opportunityId: string;
  studentId: string | null;
  reviewerDisplayName: string | null;
  ratings: ReviewRatingValue[];
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOpportunityReviewInput {
  opportunityId: string;
  studentId?: string | null;
  reviewerDisplayName?: string | null;
  ratings: ReviewRatingValue[];
  comment: string;
}
