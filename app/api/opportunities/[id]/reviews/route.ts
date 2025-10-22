import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

import { fetchReviewsForOpportunity, insertOpportunityReview } from '@/lib/review-service';
import { createReviewPayloadSchema } from '@/lib/review-validation';
import type { CreateOpportunityReviewInput } from '@/lib/review-types';
import { createClient as createServerSupabaseClient } from '@/utils/supabase/server';

interface RouteParams {
  params: {
    id?: string;
  };
}

const getOpportunityId = async ({ params }: RouteParams): Promise<string | null> => {
  const resolvedParams = await Promise.resolve(params);
  if (!resolvedParams?.id || typeof resolvedParams.id !== 'string') {
    return null;
  }
  return resolvedParams.id;
};

export async function GET(_: Request, context: RouteParams) {
  const opportunityId = await getOpportunityId(context);
  if (!opportunityId) {
    return NextResponse.json({ error: 'Hiányzó lehetőség azonosító.' }, { status: 400 });
  }

  try {
    const reviews = await fetchReviewsForOpportunity(opportunityId);
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Nem sikerült betölteni az értékeléseket:', error);
    return NextResponse.json({ error: 'Nem sikerült betölteni az értékeléseket.' }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteParams) {
  const opportunityId = await getOpportunityId(context);
  if (!opportunityId) {
    return NextResponse.json({ error: 'Hiányzó lehetőség azonosító.' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Érvénytelen kérés: hibás JSON.' }, { status: 400 });
  }

  const parsed = createReviewPayloadSchema.safeParse(body);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => issue.message);
    return NextResponse.json(
      { error: 'Érvénytelen adatok.', details: issues },
      { status: 422 },
    );
  }

  const payload = parsed.data;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error('Nem sikerült beolvasni a felhasználói adatokat:', authError);
    return NextResponse.json(
      { error: 'Nem sikerült ellenőrizni a felhasználói állapotot.' },
      { status: 500 },
    );
  }

  let studentId: string | null = null;
  let reviewerDisplayName = payload.reviewerDisplayName ?? null;

  if (user) {
    studentId = user.id;
    if (!reviewerDisplayName) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Nem sikerült lekérni a felhasználói profilt:', profileError);
      } else if (profile?.full_name) {
        reviewerDisplayName = profile.full_name;
      } else if (user.email) {
        reviewerDisplayName = user.email;
      }
    }
  }

  if (!reviewerDisplayName) {
    reviewerDisplayName = 'Anonim diák';
  }

  const sanitizedComment = payload.comment.trim();
  const sanitizedRatings = payload.ratings.map((rating) => ({
    ...rating,
    key: rating.key.trim(),
    label: rating.label.trim(),
    value: rating.value,
  }));

  const insertPayload: CreateOpportunityReviewInput = {
    opportunityId,
    studentId,
    reviewerDisplayName,
    comment: sanitizedComment,
    ratings: sanitizedRatings,
  };

  try {
    const review = await insertOpportunityReview(insertPayload);
    if (!review) {
      return NextResponse.json(
        { error: 'Nem sikerült rögzíteni az értékelést.' },
        { status: 500 },
      );
    }

    revalidatePath(`/opportunity/${opportunityId}`);
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Nem sikerült rögzíteni az értékelést:', error);
    return NextResponse.json(
      { error: 'Nem sikerült rögzíteni az értékelést.' },
      { status: 500 },
    );
  }
}
