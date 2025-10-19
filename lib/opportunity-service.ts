import { createClient as createServerSupabaseClient } from '@/utils/supabase/server';

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryLabel: string;
  location: {
    address: string;
    lat?: number;
    lng?: number;
  };
  deadline?: string | null;
  organizationName: string;
  distanceKm?: number;
  longDescription?: string;
  organizationEmail?: string;
  organizationPhone?: string;
  organizationWebsite?: string;
}

interface SupabaseOpportunityRow {
  id: string;
  title: string;
  description: string | null;
  short_description: string | null;
  address: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  published: boolean;
  deadline: string | null;
  opportunity_categories: {
    id: string;
    slug: string;
    label_hu: string;
  } | null;
  organization: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
  } | null;
}

const BUDAPEST_CENTER = {
  lat: 47.4979,
  lng: 19.0402,
};

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const calculateDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadiusKm * c;
  return Math.round(distance * 10) / 10;
};

const toNumberOrUndefined = (value: number | string | null) => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

const normalizeOpportunity = (row: SupabaseOpportunityRow): Opportunity => {
  const locationAddress =
    [row.address, row.city].filter(Boolean).join(', ') || 'Helyszín egyeztetés alatt';
  const lat = toNumberOrUndefined(row.lat);
  const lng = toNumberOrUndefined(row.lng);

  return {
    id: row.id,
    title: row.title,
    description: row.short_description ?? row.description ?? '',
    category: row.opportunity_categories?.slug ?? 'other',
    categoryLabel: row.opportunity_categories?.label_hu ?? row.opportunity_categories?.slug ?? 'Egyéb',
    location: {
      address: locationAddress,
      lat,
      lng,
    },
    deadline: row.deadline,
    organizationName: row.organization?.name ?? 'Ismeretlen szervezet',
    organizationEmail: row.organization?.email ?? undefined,
    organizationPhone: row.organization?.phone ?? undefined,
    organizationWebsite: row.organization?.website ?? undefined,
    longDescription: row.description ?? undefined,
    distanceKm:
      lat !== undefined && lng !== undefined
        ? calculateDistanceKm(BUDAPEST_CENTER.lat, BUDAPEST_CENTER.lng, lat, lng)
        : undefined,
  };
};

export const fetchPublishedOpportunities = async (): Promise<Opportunity[]> => {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('opportunities')
    .select(
      `
        id,
        title,
        description,
        short_description,
        address,
        city,
        lat,
        lng,
        published,
        deadline,
        opportunity_categories:opportunity_categories (
          id,
          slug,
          label_hu
        ),
        organization:organization_profiles (
          id,
          name,
          email,
          phone,
          website
        )
      `,
    )
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load opportunities from Supabase:', error);
    return [];
  }

  return (data ?? []).map(normalizeOpportunity);
};

export const fetchOpportunityById = async (id: string): Promise<Opportunity | null> => {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('opportunities')
    .select(
      `
        id,
        title,
        description,
        short_description,
        address,
        city,
        lat,
        lng,
        published,
        deadline,
        opportunity_categories:opportunity_categories (
          id,
          slug,
          label_hu
        ),
        organization:organization_profiles (
          id,
          name,
          email,
          phone,
          website
        )
      `,
    )
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Failed to load opportunity from Supabase:', error);
    return null;
  }

  if (!data || data.published !== true) {
    return null;
  }

  return normalizeOpportunity(data);
};
