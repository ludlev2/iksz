import { createClient as createServerSupabaseClient } from '@/utils/supabase/server';

export interface OpportunityShift {
  id: string;
  startAt: string;
  endAt: string;
  hoursAwarded?: number;
  capacity?: number;
  registeredCount?: number;
  status?: string;
}

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
  organizationName: string;
  nextShift?: OpportunityShift;
  distanceKm?: number;
  longDescription?: string;
  organizationEmail?: string;
  organizationPhone?: string;
  organizationWebsite?: string;
  shifts?: OpportunityShift[];
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
  shifts: {
    id: string;
    start_at: string;
    end_at: string;
    hours_awarded: number | string | null;
    capacity: number | null;
    status: string;
  }[] | null;
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

type SupabaseShiftRow = SupabaseOpportunityRow['shifts'][number];

const normalizeShift = (shift: SupabaseShiftRow): OpportunityShift => {
  let hoursAwarded = toNumberOrUndefined(shift.hours_awarded);

  if (hoursAwarded === undefined) {
    const start = new Date(shift.start_at);
    const end = new Date(shift.end_at);
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    hoursAwarded = Number(diff.toFixed(1));
  }

  return {
    id: shift.id,
    startAt: shift.start_at,
    endAt: shift.end_at,
    hoursAwarded,
    capacity: shift.capacity ?? undefined,
    registeredCount: 0,
    status: shift.status,
  };
};

const normalizeOpportunity = (row: SupabaseOpportunityRow): Opportunity => {
  const locationAddress =
    [row.address, row.city].filter(Boolean).join(', ') || 'Helyszín egyeztetés alatt';
  const lat = toNumberOrUndefined(row.lat);
  const lng = toNumberOrUndefined(row.lng);

  const normalizedShifts = (row.shifts ?? []).map((shift) => normalizeShift(shift));
  const publishedShifts = normalizedShifts.filter((shift) => shift.status === 'published');
  const shiftPool = publishedShifts.length > 0 ? publishedShifts : normalizedShifts;
  const nextShift = shiftPool
    .slice()
    .sort(
      (a, b) =>
        new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    )[0];

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
    organizationName: row.organization?.name ?? 'Ismeretlen szervezet',
    organizationEmail: row.organization?.email ?? undefined,
    organizationPhone: row.organization?.phone ?? undefined,
    organizationWebsite: row.organization?.website ?? undefined,
    longDescription: row.description ?? undefined,
    nextShift,
    distanceKm:
      lat !== undefined && lng !== undefined
        ? calculateDistanceKm(BUDAPEST_CENTER.lat, BUDAPEST_CENTER.lng, lat, lng)
        : undefined,
    shifts: normalizedShifts,
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
        ),
        shifts:opportunity_shifts (
          id,
          start_at,
          end_at,
          hours_awarded,
          capacity,
          status
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
        ),
        shifts:opportunity_shifts (
          id,
          start_at,
          end_at,
          hours_awarded,
          capacity,
          status
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
