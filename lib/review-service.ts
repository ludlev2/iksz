import { createClient as createServerSupabaseClient } from '@/utils/supabase/server';
import type { OpportunityReview, ReviewRatingValue, CreateOpportunityReviewInput } from '@/lib/review-types';
import { reviewRatingsSchema } from '@/lib/review-validation';

interface SupabaseOpportunityReviewRow {
  id: string;
  opportunity_id: string;
  student_id: string | null;
  reviewer_display_name: string | null;
  ratings: unknown;
  comment: string;
  created_at: string;
  updated_at: string;
}

const parseRatings = (value: unknown): ReviewRatingValue[] => {
  const result = reviewRatingsSchema.safeParse(value);
  if (!result.success) {
    throw new Error('Érvénytelen értékelési struktúra az adatbázisban.');
  }
  return result.data;
};

const normalizeReview = (row: SupabaseOpportunityReviewRow): OpportunityReview => ({
  id: row.id,
  opportunityId: row.opportunity_id,
  studentId: row.student_id,
  reviewerDisplayName: row.reviewer_display_name,
  ratings: parseRatings(row.ratings),
  comment: row.comment,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const fetchReviewsForOpportunity = async (opportunityId: string): Promise<OpportunityReview[]> => {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('opportunity_reviews')
    .select('*')
    .eq('opportunity_id', opportunityId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Hiba történt az értékelések betöltése során:', error);
    return [];
  }

  const rows = (data as SupabaseOpportunityReviewRow[]) ?? [];
  return rows.map(normalizeReview);
};

export const insertOpportunityReview = async (
  input: CreateOpportunityReviewInput,
): Promise<OpportunityReview | null> => {
  const supabase = await createServerSupabaseClient();

  const ratingsValidation = reviewRatingsSchema.safeParse(input.ratings);
  if (!ratingsValidation.success) {
    throw new Error('Az értékelések formátuma érvénytelen.');
  }

  const insertPayload = {
    opportunity_id: input.opportunityId,
    student_id: input.studentId ?? null,
    reviewer_display_name: input.reviewerDisplayName ?? null,
    ratings: ratingsValidation.data,
    comment: input.comment,
  };

  const { data, error } = await supabase
    .from('opportunity_reviews')
    .insert(insertPayload)
    .select('*')
    .maybeSingle();

  if (error) {
    console.error('Hiba történt az értékelés rögzítése során:', error);
    throw new Error('Nem sikerült rögzíteni az értékelést.');
  }

  if (!data) {
    return null;
  }

  return normalizeReview(data as SupabaseOpportunityReviewRow);
};
