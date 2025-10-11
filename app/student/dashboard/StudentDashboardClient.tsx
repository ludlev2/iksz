'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Search, Map as MapIcon, List, LogOut, HelpCircle, Calendar, Clock, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/AuthContext';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import OpportunityCard from '@/components/OpportunityCard';
import FilterDrawer from '@/components/FilterDrawer';
import HourCounter from '@/components/HourCounter';
import type { Opportunity } from '@/lib/opportunity-service';
import { createClient } from '@/utils/supabase/client';

const OpportunityMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="h-96 rounded-lg border bg-gray-100 flex items-center justify-center">
      Térkép betöltése...
    </div>
  ),
});

type SortOption = 'recent' | 'soonest' | 'distance';

interface Filters {
  distance: number;
  categories: string[];
  date: Date | undefined;
  sort: SortOption;
}

interface StudentDashboardClientProps {
  initialOpportunities: Opportunity[];
}

interface FavoriteItem {
  opportunityId: string;
  title: string;
  organizationName: string;
  nextShiftStart: string | null;
  location: string | null;
}

interface UpcomingShiftItem {
  applicationId: string;
  status: string;
  shiftId: string;
  startAt: string;
  endAt: string | null;
  hoursAwarded: number | null;
  opportunityId: string;
  title: string;
  organizationName: string;
  location: string | null;
}

interface CategoryOption {
  id: string;
  slug: string;
  label: string;
}

type AugmentedOpportunity = Opportunity & {
  hasPendingApplication?: boolean;
};

const DEFAULT_DISTANCE = 10;
const DEFAULT_MAP_CENTER = { lat: 47.4979, lng: 19.0402 } as const;
const DEFAULT_SORT: SortOption = 'recent';

const createDefaultFilters = (): Filters => ({
  distance: DEFAULT_DISTANCE,
  categories: [],
  date: undefined,
  sort: DEFAULT_SORT,
});

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Legújabb' },
  { value: 'soonest', label: 'Legközelebbi időpont' },
  { value: 'distance', label: 'Legközelebbi távolság' },
];

const formatDate = (isoDate: string) =>
  new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(isoDate));

const formatTime = (isoDate: string) =>
  new Intl.DateTimeFormat('hu-HU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate));

const toHoursNumber = (value: number | string | null | undefined): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

export default function StudentDashboardClient({ initialOpportunities }: StudentDashboardClientProps) {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [locationRequested, setLocationRequested] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [filters, setFilters] = useState<Filters>(() => createDefaultFilters());
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);
  const [upcomingShifts, setUpcomingShifts] = useState<UpcomingShiftItem[]>([]);
  const [upcomingLoading, setUpcomingLoading] = useState(false);
  const [upcomingError, setUpcomingError] = useState<string | null>(null);
  const [favoriteUpdatingId, setFavoriteUpdatingId] = useState<string | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailOpportunity, setEmailOpportunity] = useState<Opportunity | null>(null);
  const [emailBody, setEmailBody] = useState('');
  const [emailShiftId, setEmailShiftId] = useState<string | null>(null);
  const [signupLoadingId, setSignupLoadingId] = useState<string | null>(null);
  const [shiftRegistrations, setShiftRegistrations] = useState<Record<string, number>>({});
  const [cancellingApplicationId, setCancellingApplicationId] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const handleResetFilters = useCallback(() => {
    setFilters(createDefaultFilters());
  }, []);

  const requestUserLocation = useCallback(() => {
    if (locationRequested) {
      return;
    }

    setLocationRequested(true);

    if (!navigator.geolocation) {
      toast.info('A böngésző nem támogatja a helymeghatározást.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        if (error.code !== error.PERMISSION_DENIED) {
          toast.error('Nem sikerült lekérni a helyzeted.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 7000,
        maximumAge: 60_000,
      },
    );
  }, [locationRequested]);

  const handleEmailDialogOpenChange = useCallback((open: boolean) => {
    setEmailDialogOpen(open);
    if (!open) {
      setEmailOpportunity(null);
      setEmailShiftId(null);
      setEmailBody('');
      setSignupLoadingId(null);
    }
  }, []);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setFavoritesError(null);
      setFavoritesLoading(false);
      return;
    }

    const studentId = user.id;

    setFavoritesLoading(true);
    setFavoritesError(null);

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(
          `
            opportunity:opportunities (
              id,
              title,
              address,
              city,
              organization:organization_profiles (
                name
              ),
              shifts:opportunity_shifts (
                id,
                start_at,
                end_at,
                status
              )
            )
          `,
        )
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!user || user.id !== studentId) {
        return;
      }

      if (error) {
        console.error('Error loading favorites:', error);
        setFavorites([]);
        setFavoritesError('Nem sikerült betölteni a kedvenceket.');
        return;
      }

      const mapped =
        data
          ?.map((row) => {
            const opportunity = row.opportunity;
            if (!opportunity) {
              return null;
            }

            const shifts = (opportunity.shifts ?? []) as Array<{
              id: string;
              start_at: string;
              end_at: string | null;
              status: string | null;
            }>;

            const publishedShifts = shifts.filter((shift) => shift.status === 'published');
            const upcoming = (publishedShifts.length > 0 ? publishedShifts : shifts)
              .slice()
              .sort(
                (a, b) =>
                  new Date(a.start_at).getTime() - new Date(b.start_at).getTime(),
              )[0];

            const address = [opportunity.address, opportunity.city].filter(Boolean).join(', ') || null;

            return {
              opportunityId: opportunity.id,
              title: opportunity.title,
              organizationName: opportunity.organization?.name ?? 'Ismeretlen szervezet',
              nextShiftStart: upcoming?.start_at ?? null,
              location: address,
            } satisfies FavoriteItem;
          })
          .filter(Boolean) as FavoriteItem[];

      setFavorites(mapped ?? []);
    } catch (error) {
      console.error('Unexpected error loading favorites:', error);
      setFavorites([]);
      setFavoritesError('Nem sikerült betölteni a kedvenceket.');
    } finally {
      setFavoritesLoading(false);
    }
  }, [supabase, user]);

  const refreshShiftRegistration = useCallback(
    async (shiftId: string) => {
      const { error, count } = await supabase
        .from('student_applications')
        .select('id', { count: 'exact', head: true })
        .eq('shift_id', shiftId)
        .in('status', ['pending', 'approved']);

      if (error) {
        console.error('Error loading shift registrations:', error);
        return;
      }

      if (typeof count === 'number') {
        setShiftRegistrations((previous) => ({
          ...previous,
          [shiftId]: count,
        }));
      }
    },
    [supabase],
  );

  const fetchUpcomingShifts = useCallback(async () => {
    if (!user) {
      setUpcomingShifts([]);
      setUpcomingError(null);
      setUpcomingLoading(false);
      return;
    }

    const studentId = user.id;

    setUpcomingLoading(true);
    setUpcomingError(null);

    try {
      const { data, error } = await supabase
        .from('student_applications')
        .select(
          `
            id,
            status,
            shift:opportunity_shifts (
              id,
              start_at,
              end_at,
              hours_awarded,
              status,
              opportunity:opportunities (
                id,
                title,
                address,
                city,
                organization:organization_profiles ( name )
              )
            )
          `,
        )
        .eq('student_id', studentId)
        .in('status', ['pending', 'approved'])
        .order('submitted_at', { ascending: true })
        .limit(6);

      if (!user || user.id !== studentId) {
        return;
      }

      if (error) {
        console.error('Error loading upcoming shifts:', error);
        setUpcomingShifts([]);
        setUpcomingError('Nem sikerült betölteni a jelentkezéseket.');
        return;
      }

      const mapped =
        data
          ?.map((row) => {
            if (!row.shift || !row.shift.opportunity) {
              return null;
            }

            const { shift } = row;
            const opportunity = shift.opportunity;
            const address = [opportunity.address, opportunity.city].filter(Boolean).join(', ') || null;

            return {
              applicationId: row.id,
              status: row.status,
              shiftId: shift.id,
              startAt: shift.start_at,
              endAt: shift.end_at ?? null,
              hoursAwarded: toHoursNumber(shift.hours_awarded),
              opportunityId: opportunity.id,
              title: opportunity.title,
              organizationName: opportunity.organization?.name ?? 'Ismeretlen szervezet',
              location: address,
            } satisfies UpcomingShiftItem;
          })
          .filter((item): item is UpcomingShiftItem => {
            if (!item) {
              return false;
            }

            // Hide past shifts
            return new Date(item.startAt).getTime() >= Date.now() - 1000 * 60 * 60 * 24;
          })
          .sort(
            (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
          );

      setUpcomingShifts(mapped ?? []);
    } catch (error) {
      console.error('Unexpected error loading upcoming shifts:', error);
      setUpcomingShifts([]);
      setUpcomingError('Nem sikerült betölteni a jelentkezéseket.');
    } finally {
      setUpcomingLoading(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setUpcomingShifts([]);
      setFavoritesError(null);
      setUpcomingError(null);
      setFavoritesLoading(false);
      setUpcomingLoading(false);
      setFavoriteUpdatingId(null);
      return;
    }

    fetchFavorites();
    fetchUpcomingShifts();
  }, [fetchFavorites, fetchUpcomingShifts, user]);

  useEffect(() => {
    const shiftIds = Array.from(
      new Set(
        initialOpportunities
          .map((opportunity) => opportunity.nextShift?.id)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    shiftIds.forEach((shiftId) => {
      refreshShiftRegistration(shiftId);
    });
  }, [initialOpportunities, refreshShiftRegistration]);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);

      const { data, error } = await supabase
        .from('opportunity_categories')
        .select('id, slug, label_hu')
        .order('label_hu', { ascending: true });

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error('Error loading opportunity categories:', error);
        setCategoriesError('Nem sikerült betölteni a kategóriákat.');
        setCategories([]);
      } else {
        setCategories(
          (data ?? []).map((category) => ({
            id: category.id,
            slug: category.slug,
            label: category.label_hu ?? category.slug,
          })),
        );
      }

      setCategoriesLoading(false);
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((favorite) => favorite.opportunityId)),
    [favorites],
  );
  const favoriteIdList = useMemo(
    () => favorites.map((favorite) => favorite.opportunityId),
    [favorites],
  );

  const opportunitiesWithCounts = useMemo<AugmentedOpportunity[]>(
    () =>
      initialOpportunities.map((opportunity) => {
        if (!opportunity.nextShift) {
          return {
            ...opportunity,
            hasPendingApplication: false,
          };
        }

        const registeredOverride = shiftRegistrations[opportunity.nextShift.id];
        const hasApplication = upcomingShifts.some(
          (shift) =>
            shift.shiftId === opportunity.nextShift?.id &&
            (shift.status === 'pending' || shift.status === 'approved'),
        );

      const mergedOpportunity = {
        ...opportunity,
        hasPendingApplication: hasApplication,
      };

      if (registeredOverride !== undefined) {
        mergedOpportunity.nextShift = {
          ...opportunity.nextShift,
          registeredCount: registeredOverride,
        };
      }

      return mergedOpportunity;
    }),
    [initialOpportunities, shiftRegistrations, upcomingShifts],
  );

  const initialOrderMap = useMemo(() => {
    const map = new Map<string, number>();
    initialOpportunities.forEach((opportunity, index) => {
      map.set(opportunity.id, index);
    });
    return map;
  }, [initialOpportunities]);

  const handleToggleFavorite = useCallback(
    async (opportunityId: string, shouldFavorite: boolean) => {
      if (!user) {
        toast.error('A mentéshez be kell jelentkezned!', {
          action: {
            label: 'Bejelentkezés',
            onClick: () => router.push('/student'),
          },
        });
        return;
      }

      setFavoriteUpdatingId(opportunityId);

      try {
        if (shouldFavorite) {
          const { error } = await supabase.from('favorites').insert({
            student_id: user.id,
            opportunity_id: opportunityId,
          });
          if (error && error.code !== '23505') {
            throw error;
          }
        } else {
          const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('student_id', user.id)
            .eq('opportunity_id', opportunityId);
          if (error) {
            throw error;
          }
        }

        await fetchFavorites();

        toast.success(
          shouldFavorite
            ? 'Hozzáadva a kedvencekhez!'
            : 'Eltávolítva a kedvencek közül.',
        );
      } catch (error) {
        console.error('Error updating favorites:', error);
        toast.error('Nem sikerült frissíteni a kedvenceket.');
      } finally {
        setFavoriteUpdatingId(null);
      }
    },
    [fetchFavorites, router, supabase, user],
  );

  const handleCancelApplication = useCallback(
    async (applicationId: string, shiftId: string) => {
      if (!user) {
        toast.error('A lemondáshoz be kell jelentkezned!', {
          action: {
            label: 'Bejelentkezés',
            onClick: () => router.push('/student'),
          },
        });
        return;
      }

      setCancellingApplicationId(applicationId);

      try {
        const { error } = await supabase
          .from('student_applications')
          .update({ status: 'cancelled' })
          .eq('id', applicationId)
          .eq('student_id', user.id);

        if (error) {
          throw error;
        }

        toast.success('Jelentkezés lemondva.');
        await fetchUpcomingShifts();
        await refreshShiftRegistration(shiftId);
      } catch (error) {
        console.error('Error cancelling application:', error);
        toast.error('Nem sikerült lemondani a jelentkezést.');
      } finally {
        setCancellingApplicationId(null);
      }
    },
    [fetchUpcomingShifts, refreshShiftRegistration, router, supabase, user],
  );

  const filteredOpportunities = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const matches = opportunitiesWithCounts.filter((opportunity) => {
      if (
        normalizedQuery &&
        !opportunity.title.toLowerCase().includes(normalizedQuery) &&
        !opportunity.description.toLowerCase().includes(normalizedQuery) &&
        !opportunity.organizationName.toLowerCase().includes(normalizedQuery)
      ) {
        return false;
      }

      if (filters.categories.length > 0 && !filters.categories.includes(opportunity.category)) {
        return false;
      }

      if (filters.date) {
        const shiftDate = opportunity.nextShift ? new Date(opportunity.nextShift.startAt) : null;
        if (!shiftDate || shiftDate.toDateString() !== filters.date.toDateString()) {
          return false;
        }
      }

      const distance = typeof opportunity.distanceKm === 'number' ? opportunity.distanceKm : 0;
      if (distance > filters.distance) {
        return false;
      }

      return true;
    });

    const sorted = [...matches];

    switch (filters.sort) {
      case 'soonest':
        sorted.sort((a, b) => {
          const aTime = a.nextShift ? new Date(a.nextShift.startAt).getTime() : Number.POSITIVE_INFINITY;
          const bTime = b.nextShift ? new Date(b.nextShift.startAt).getTime() : Number.POSITIVE_INFINITY;
          return aTime - bTime;
        });
        break;
      case 'distance':
        sorted.sort((a, b) => {
          const aDistance = typeof a.distanceKm === 'number' ? a.distanceKm : Number.POSITIVE_INFINITY;
          const bDistance = typeof b.distanceKm === 'number' ? b.distanceKm : Number.POSITIVE_INFINITY;
          return aDistance - bDistance;
        });
        break;
      case 'recent':
      default:
        sorted.sort((a, b) => {
          const aOrder = initialOrderMap.get(a.id) ?? 0;
          const bOrder = initialOrderMap.get(b.id) ?? 0;
          return aOrder - bOrder;
        });
        break;
    }

    return sorted;
  }, [filters, initialOrderMap, opportunitiesWithCounts, searchQuery]);

  const mapCenter = useMemo(() => {
    if (userLocation) {
      return userLocation;
    }

    for (const opportunity of filteredOpportunities) {
      const lat = opportunity.location?.lat;
      const lng = opportunity.location?.lng;
      if (typeof lat === 'number' && typeof lng === 'number') {
        return { lat, lng };
      }
    }

    return DEFAULT_MAP_CENTER;
  }, [filteredOpportunities, userLocation]);

  const handleRequest = useCallback(
    async (opportunityId: string) => {
      if (!user) {
        toast.error('A jelentkezéshez be kell jelentkezned!', {
          description: 'Hozz létre egy fiókot vagy jelentkezz be.',
          action: {
            label: 'Bejelentkezés',
            onClick: () => router.push('/student'),
          },
        });
        return;
      }

      const opportunity = opportunitiesWithCounts.find((item) => item.id === opportunityId);

      if (!opportunity) {
        toast.error('Nem található ez a lehetőség.');
        return;
      }

      const nextShift = opportunity.nextShift;

      setEmailOpportunity(opportunity);
      if (!nextShift) {
        setEmailShiftId(null);
        setEmailBody(
          `Szia ${opportunity.organizationName},\n\nSzeretnék érdeklődni a(z) "${opportunity.title}" lehetőség iránt. ` +
            'Kérlek jelezz vissza, hogy van-e elérhető műszak számomra.\n\nKöszönöm előre is!\n',
        );
      } else {
        setEmailShiftId(nextShift.id);
        setEmailBody(
          `Szia ${opportunity.organizationName},\n\n` +
            `Jelentkeznék a(z) "${opportunity.title}" lehetőség ${formatDate(nextShift.startAt)} időpontjára. ` +
            'Kérlek szólj vissza, ha megfelel, illetve ha szükség van további információra.\n\nKöszönöm!\n',
        );
      }

      setEmailDialogOpen(true);
    },
    [opportunitiesWithCounts, router, user],
  );

  const handleSendEmail = useCallback(() => {
    if (!emailOpportunity?.organizationEmail) {
      toast.error('Ehhez a lehetőséghez nincs megadott email cím.');
      return;
    }

    const subject = `Érdeklődés: ${emailOpportunity.title}`;
    const mailtoLink = `mailto:${encodeURIComponent(
      emailOpportunity.organizationEmail,
    )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

    window.location.href = mailtoLink;
  }, [emailBody, emailOpportunity]);

  const handleConfirmSignup = async () => {
    if (!user) {
      toast.error('A jelentkezéshez be kell jelentkezned!', {
        action: {
          label: 'Bejelentkezés',
          onClick: () => router.push('/student'),
        },
      });
      return;
    }

    if (!emailOpportunity || !emailShiftId) {
      toast.error('Nem sikerült azonosítani a műszakot.');
      return;
    }

    setSignupLoadingId(emailOpportunity.id);

    try {
      const { data: inserted, error } = await supabase
        .from('student_applications')
        .insert({
          student_id: user.id,
          shift_id: emailShiftId,
          status: 'pending',
        })
        .select('id')
        .maybeSingle();

      if (error) {
        if (error.code === '23505') {
          const { data: existing, error: fetchError } = await supabase
            .from('student_applications')
            .select('id, status')
            .eq('student_id', user.id)
            .eq('shift_id', emailShiftId)
            .maybeSingle();

          if (fetchError) {
            throw fetchError;
          }

          if (existing) {
            if (existing.status === 'cancelled') {
              const { error: updateError } = await supabase
                .from('student_applications')
                .update({
                  status: 'pending',
                  submitted_at: new Date().toISOString(),
                })
                .eq('id', existing.id);

              if (updateError) {
                throw updateError;
              }

              toast.success('Jelentkezés újra aktiválva!', {
                description: 'Értesítjük a szervezőt, hogy ismét számíthat rád.',
              });
            } else {
              toast.info('Már jelentkeztél erre a műszakra.');
            }
          }
        } else {
          throw error;
        }
      } else {
        toast.success('Jelentkezés elküldve!', {
          description: 'A szervező hamarosan felveszi veled a kapcsolatot.',
        });

      }

      await fetchUpcomingShifts();
      await refreshShiftRegistration(emailShiftId);

      setEmailDialogOpen(false);
      setEmailOpportunity(null);
      setEmailShiftId(null);
      setEmailBody('');
    } catch (error) {
      console.error('Error confirming application:', error);
      toast.error('Nem sikerült elküldeni a jelentkezést.');
    } finally {
      setSignupLoadingId(null);
    }
  };

  const handleMarkerClick = (opportunityId: string) => {
    router.push(`/opportunity/${opportunityId}`);
  };

  const handleViewDetails = (opportunityId: string) => {
    router.push(`/opportunity/${opportunityId}`);
  };

  useEffect(() => {
    if (activeTab === 'map') {
      requestUserLocation();
    }
  }, [activeTab, requestUserLocation]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      (window as unknown as Record<string, unknown>).__IKSZ_OPPORTUNITIES = opportunitiesWithCounts.map(
        (opportunity) => ({
          id: opportunity.id,
          title: opportunity.title,
          lat: opportunity.location?.lat ?? null,
          lng: opportunity.location?.lng ?? null,
          category: opportunity.category,
        }),
      );
    }
  }, [opportunitiesWithCounts]);

  if (authLoading) {
    return <div className="p-6">Betöltés...</div>;
  }

  const isGuestView = !user;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {isGuestView ? (
              <>
                <h1 className="text-2xl font-bold text-gray-900">Önkéntes lehetőségek</h1>
                <p className="text-gray-600">Böngészd a lehetőségeket regisztráció nélkül</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900">Üdvözlünk, {user?.name}!</h1>
                <p className="text-gray-600">
                  {user?.school} - {user?.grade}. évfolyam
                </p>
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => router.push('/submit')}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Új lehetőség beküldése
            </Button>
            <Button variant="outline" onClick={() => router.push('/help')}>
              <HelpCircle className="w-4 h-4 mr-2" />
              Szerződés Segítő
            </Button>
            {isGuestView ? (
              <Button onClick={() => router.push('/student')}>Bejelentkezés</Button>
            ) : (
              <Button variant="outline" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Kijelentkezés
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className={`grid gap-6 ${isGuestView ? 'lg:grid-cols-1' : 'lg:grid-cols-4'}`}>
          {!isGuestView && (
            <div className="lg:col-span-1 space-y-6">
              <HourCounter
                completedHours={user?.completedHours || 0}
                pendingHours={user?.pendingHours || 0}
              />

              <FavoritesPanel
                items={favorites}
                isLoading={favoritesLoading}
                error={favoritesError}
                onViewDetails={handleViewDetails}
              />

              <UpcomingShiftsPanel
                items={upcomingShifts}
                isLoading={upcomingLoading}
                error={upcomingError}
                onViewDetails={handleViewDetails}
                onCancel={handleCancelApplication}
                cancellingId={cancellingApplicationId}
              />
            </div>
          )}

          <div className={isGuestView ? 'lg:col-span-1' : 'lg:col-span-3'}>
            <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-lg p-6 mb-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Kell segítség a szerződéshez? 📋</h3>
              <p className="text-blue-100">
                Töltsd le a szerződésmintákat, ismerj meg minden jogszabályi követelményt, és kérj
                segítséget lépésről lépésre.
              </p>
            </div>

            <div className="bg-white rounded-lg border p-4 mb-6">
              <div className="flex flex-col gap-4 mb-4 lg:flex-row">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Keresés lehetőségek között..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="pl-10"
                  />
                </div>
                <FilterDrawer
                  filters={filters}
                  onFiltersChange={setFilters}
                  onResetFilters={handleResetFilters}
                  categories={categories}
                  isLoadingCategories={categoriesLoading}
                  categoriesError={categoriesError}
                  defaultDistance={DEFAULT_DISTANCE}
                  isDefaultSort={filters.sort === DEFAULT_SORT}
                />
                <Select
                  value={filters.sort}
                  onValueChange={(value) =>
                    setFilters((previous) => ({
                      ...previous,
                      sort: value as SortOption,
                    }))
                  }
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Rendezés" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="list" className="flex items-center gap-2">
                    <List className="w-4 h-4" />
                    Lista
                  </TabsTrigger>
                  <TabsTrigger value="map" className="flex items-center gap-2">
                    <MapIcon className="w-4 h-4" />
                    Térkép
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="mt-6">
                  <div className="space-y-4">
                    {filteredOpportunities.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        Nincs találat a keresési feltételeknek megfelelően.
                      </div>
                    ) : (
                      filteredOpportunities.map((opportunity) => (
                        <OpportunityCard
                          key={opportunity.id}
                          opportunity={opportunity}
                          distance={isGuestView ? undefined : opportunity.distanceKm}
                          onRequest={handleRequest}
                          onViewDetails={handleViewDetails}
                          isFavorite={favoriteIds.has(opportunity.id)}
                          onToggleFavorite={handleToggleFavorite}
                          favoriteDisabled={favoriteUpdatingId === opportunity.id}
                          signupDisabled={signupLoadingId === opportunity.id}
                          hasPendingApplication={Boolean(opportunity.hasPendingApplication)}
                        />
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="map" className="mt-6">
                  <div className="h-96 rounded-lg overflow-hidden border">
                    <OpportunityMap
                      center={mapCenter}
                      opportunities={filteredOpportunities}
                      userLocation={userLocation}
                      favoriteIds={favoriteIdList}
                      onMarkerClick={handleMarkerClick}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      <EmailDialog
        open={emailDialogOpen}
        onOpenChange={handleEmailDialogOpenChange}
        opportunity={emailOpportunity}
        emailBody={emailBody}
        onEmailBodyChange={setEmailBody}
        onSendEmail={handleSendEmail}
        onConfirm={emailShiftId ? handleConfirmSignup : undefined}
        confirmDisabled={signupLoadingId === emailOpportunity?.id}
        canConfirm={Boolean(emailShiftId)}
      />
    </div>
  );
}

interface EmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity: Opportunity | null;
  emailBody: string;
  onEmailBodyChange: (value: string) => void;
  onSendEmail: () => void;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  canConfirm?: boolean;
}

function EmailDialog({
  open,
  onOpenChange,
  opportunity,
  emailBody,
  onEmailBodyChange,
  onSendEmail,
  onConfirm,
  confirmDisabled = false,
  canConfirm = false,
}: EmailDialogProps) {
  const emailAddress = opportunity?.organizationEmail ?? '';
  const hasEmail = Boolean(emailAddress);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kapcsolatfelvétel a szervezővel</DialogTitle>
          <DialogDescription>
            Küldj egy rövid bemutatkozó emailt a szervezőnek. Miután elküldted, térj vissza és erősítsd meg az elküldést, hogy rögzíteni tudjuk a jelentkezésed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Címzett</label>
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
              <Mail className="h-4 w-4 text-gray-500" />
              <span>{emailAddress || 'Nincs megadva email cím'}</span>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Üzenet</label>
            <textarea
              className="w-full min-h-[180px] rounded-lg border px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              value={emailBody}
              onChange={(event) => onEmailBodyChange(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bezárás
          </Button>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="secondary" onClick={onSendEmail} disabled={!hasEmail}>
              {hasEmail ? 'Email megnyitása' : 'Nem elérhető'}
            </Button>
            {onConfirm && (
              <Button
                onClick={onConfirm}
                disabled={confirmDisabled || !canConfirm}
              >
                {confirmDisabled ? 'Megerősítés...' : 'Elküldtem az emailt'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface FavoritesPanelProps {
  items: FavoriteItem[];
  isLoading: boolean;
  error: string | null;
  onViewDetails: (opportunityId: string) => void;
}

function FavoritesPanel({ items, isLoading, error, onViewDetails }: FavoritesPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Mentett lehetőségek</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Még nincsenek mentett lehetőségeid. Kattints a szívecskére a kedvencekhez adáshoz.
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.opportunityId} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.organizationName}
                    </p>
                    {item.location && (
                      <p className="text-xs text-muted-foreground mt-1">{item.location}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewDetails(item.opportunityId)}
                  >
                    Részletek
                  </Button>
                </div>
                {item.nextShiftStart && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(item.nextShiftStart)}</span>
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(item.nextShiftStart)}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

interface UpcomingShiftsPanelProps {
  items: UpcomingShiftItem[];
  isLoading: boolean;
  error: string | null;
  onViewDetails: (opportunityId: string) => void;
  onCancel?: (applicationId: string, shiftId: string) => void;
  cancellingId?: string | null;
}

const statusBadges: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  waitlisted: 'bg-orange-100 text-orange-700',
  rejected: 'bg-red-100 text-red-700',
};

function UpcomingShiftsPanel({
  items,
  isLoading,
  error,
  onViewDetails,
  onCancel,
  cancellingId,
}: UpcomingShiftsPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Közelgő műszakok</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Jelenleg nincs közelgő jelentkezésed. Jelentkezz egy lehetőségre, hogy itt megjelenjen.
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.applicationId} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.organizationName}
                    </p>
                    {item.location && (
                      <p className="text-xs text-muted-foreground mt-1">{item.location}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={statusBadges[item.status] ?? 'bg-blue-100 text-blue-700'}>
                      {item.status === 'approved'
                        ? 'Jóváhagyva'
                        : item.status === 'pending'
                        ? 'Folyamatban'
                        : item.status === 'waitlisted'
                        ? 'Várólista'
                        : item.status === 'rejected'
                        ? 'Elutasítva'
                        : item.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewDetails(item.opportunityId)}
                    >
                      Részletek
                    </Button>
                    {onCancel && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onCancel(item.applicationId, item.shiftId)}
                        disabled={cancellingId === item.applicationId}
                      >
                        {cancellingId === item.applicationId ? 'Lemondás...' : 'Lemondás'}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(item.startAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(item.startAt)}</span>
                  </div>
                  {item.hoursAwarded !== null && (
                    <div className="flex items-center gap-1">
                      <span>•</span>
                      <span>{item.hoursAwarded} óra</span>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
