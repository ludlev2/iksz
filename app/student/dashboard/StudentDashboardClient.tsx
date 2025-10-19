'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Search, Map as MapIcon, List, LogOut, HelpCircle, Calendar } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/AuthContext';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

type SortOption = 'recent' | 'deadline' | 'distance';

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
  deadline: string | null;
  location: string | null;
}

interface CategoryOption {
  id: string;
  slug: string;
  label: string;
}

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
  { value: 'deadline', label: 'Legkorábbi határidő' },
  { value: 'distance', label: 'Legközelebbi távolság' },
];

const formatDate = (isoDate: string) =>
  new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(isoDate));

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
  const [favoriteUpdatingId, setFavoriteUpdatingId] = useState<string | null>(null);
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
              deadline,
              organization:organization_profiles (
                name
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

            const address = [opportunity.address, opportunity.city].filter(Boolean).join(', ') || null;

            return {
              opportunityId: opportunity.id,
              title: opportunity.title,
              organizationName: opportunity.organization?.name ?? 'Ismeretlen szervezet',
              deadline: opportunity.deadline ?? null,
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

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setFavoritesError(null);
      setFavoritesLoading(false);
      setFavoriteUpdatingId(null);
      return;
    }

    fetchFavorites();
  }, [fetchFavorites, user]);

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

  const filteredOpportunities = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const matches = initialOpportunities.filter((opportunity) => {
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
        const deadlineDate = opportunity.deadline ? new Date(opportunity.deadline) : null;
        if (!deadlineDate || deadlineDate.toDateString() !== filters.date.toDateString()) {
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
      case 'deadline':
        sorted.sort((a, b) => {
          const aTime = a.deadline ? new Date(a.deadline).getTime() : Number.POSITIVE_INFINITY;
          const bTime = b.deadline ? new Date(b.deadline).getTime() : Number.POSITIVE_INFINITY;
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
  }, [filters, initialOrderMap, initialOpportunities, searchQuery]);

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

  const handleContactOpportunity = useCallback(
    (opportunityId: string) => {
      const opportunity = initialOpportunities.find((item) => item.id === opportunityId);

      if (!opportunity) {
        toast.error('Nem található ez a lehetőség.');
        return;
      }

      if (!opportunity.organizationEmail) {
        toast.info('Ehhez a lehetőséghez nem található email cím. Nézd meg a részleteket!');
        router.push(`/opportunity/${opportunity.id}`);
        return;
      }

      const subject = `Érdeklődés: ${opportunity.title}`;
      const deadlineNote = opportunity.deadline
        ? ` A megadott határidő: ${formatDate(opportunity.deadline)}.`
        : '';

      const body = [
        `Szia ${opportunity.organizationName},`,
        '',
        `Érdeklődöm a(z) "${opportunity.title}" lehetőség iránt.${deadlineNote}`,
        'Kérlek jelezd, hogyan tudok csatlakozni, illetve van-e további információ, amire szükség van.',
        '',
        'Köszönöm előre is!',
      ].join('\n');

      const mailtoLink = `mailto:${encodeURIComponent(
        opportunity.organizationEmail,
      )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      window.location.href = mailtoLink;
    },
    [initialOpportunities, router],
  );

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
      (window as unknown as Record<string, unknown>).__IKSZ_OPPORTUNITIES = initialOpportunities.map(
        (opportunity) => ({
          id: opportunity.id,
          title: opportunity.title,
          lat: opportunity.location?.lat ?? null,
          lng: opportunity.location?.lng ?? null,
          category: opportunity.category,
        }),
      );
    }
  }, [initialOpportunities]);

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
                          onContact={handleContactOpportunity}
                          onViewDetails={handleViewDetails}
                          isFavorite={favoriteIds.has(opportunity.id)}
                          onToggleFavorite={handleToggleFavorite}
                          favoriteDisabled={favoriteUpdatingId === opportunity.id}
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
    </div>
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
                {item.deadline && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Határidő: {formatDate(item.deadline)}</span>
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
