import { notFound } from 'next/navigation';

import OpportunityDetailClient from './OpportunityDetailClient';
import { fetchOpportunityById } from '@/lib/opportunity-service';
import { fetchReviewsForOpportunity } from '@/lib/review-service';

interface OpportunityPageProps {
  params: {
    id: string;
  };
}

export const revalidate = 60;

export default async function OpportunityDetailPage({ params }: OpportunityPageProps) {
  const [opportunity, reviews] = await Promise.all([
    fetchOpportunityById(params.id),
    fetchReviewsForOpportunity(params.id),
  ]);

  if (!opportunity) {
    notFound();
  }

  return <OpportunityDetailClient opportunity={opportunity} reviews={reviews} />;
}
