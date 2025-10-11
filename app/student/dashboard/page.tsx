import StudentDashboardClient from './StudentDashboardClient';
import { fetchPublishedOpportunities } from '@/lib/opportunity-service';

export const revalidate = 60;

export default async function StudentDashboardPage() {
  const opportunities = await fetchPublishedOpportunities();

  return <StudentDashboardClient initialOpportunities={opportunities} />;
}
