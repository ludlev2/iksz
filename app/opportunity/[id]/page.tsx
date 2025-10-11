import { notFound } from 'next/navigation';

import OpportunityDetailClient from './OpportunityDetailClient';
import { fetchOpportunityById } from '@/lib/opportunity-service';

interface OpportunityPageProps {
  params: {
    id: string;
  };
}

export const revalidate = 60;

export default async function OpportunityDetailPage({ params }: OpportunityPageProps) {
  const opportunity = await fetchOpportunityById(params.id);

  if (!opportunity) {
    notFound();
  }

  return <OpportunityDetailClient opportunity={opportunity} />;
}
