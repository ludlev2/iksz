'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Map as MapIcon, List, LogOut, HelpCircle } from 'lucide-react';
import OpportunityCard from '@/components/OpportunityCard';
import FilterDrawer from '@/components/FilterDrawer';
import HourCounter from '@/components/HourCounter';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';

// Dynamically import Map component with SSR disabled
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="h-96 rounded-lg border bg-gray-100 flex items-center justify-center">Térkép betöltése...</div>
});

interface Opportunity {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  location: string;
  hours: number;
  provider: string;
  maxParticipants: number;
  currentParticipants: number;
  requirements?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface Filters {
  distance: number;
  categories: string[];
  date: string | undefined;
}

export default function StudentDashboard() {
  const { user, logout, isGuestMode, isLoading } = useAuth();
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [filters, setFilters] = useState<Filters>({
    distance: 10,
    categories: [],
    date: undefined
  });

  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) {
      return;
    }

    // Allow access if user is a logged-in student OR in guest mode
    if (!user && !isGuestMode) {
      console.log('No user and no guest mode, redirecting to /student');
      router.push('/student');
      return;
    }
    
    if (user && user.role !== 'student') {
      console.log('User is not a student, redirecting to /login');
      router.push('/login');
      return;
    }

    console.log('Loading opportunities, user:', user, 'isGuestMode:', isGuestMode);

    // Load opportunities
    fetch('/data/mock-opportunities.json')
      .then(res => res.json())
      .then((data: Opportunity[]) => {
        setOpportunities(data);
        setFilteredOpportunities(data);
      })
      .catch(err => console.error('Error loading opportunities:', err));
  }, [user, isGuestMode, isLoading, router]);

  useEffect(() => {
    // Apply filters
    let filtered = opportunities.filter(opp => {
      // Search filter
      if (searchQuery && !opp.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !opp.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(opp.category)) {
        return false;
      }

      // Date filter
      if (filters.date) {
        const oppDate = new Date(opp.date);
        const filterDate = new Date(filters.date);
        if (oppDate.toDateString() !== filterDate.toDateString()) {
          return false;
        }
      }

      // Distance filter (mock calculation)
      const distance = Math.random() * 15; // Mock distance
      if (distance > filters.distance) {
        return false;
      }

      return true;
    });

    setFilteredOpportunities(filtered);
  }, [opportunities, searchQuery, filters]);

  const handleRequest = (opportunityId: string) => {
    if (isGuestMode) {
      toast.error('A jelentkezéshez be kell jelentkezned!', {
        description: 'Hozz létre egy fiókot vagy jelentkezz be.',
        action: {
          label: 'Bejelentkezés',
          onClick: () => router.push('/student')
        }
      });
      return;
    }
    
    // Mock request logic
    console.log('Requesting opportunity:', opportunityId);
  };

  const handleMarkerClick = (opportunityId: string) => {
    router.push(`/opportunity/${opportunityId}`);
  };

  if (isLoading || (!user && !isGuestMode)) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            {isGuestMode ? (
              <>
                <h1 className="text-2xl font-bold text-gray-900">Önkéntes lehetőségek</h1>
                <p className="text-gray-600">Böngészd a lehetőségeket regisztráció nélkül</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900">Üdvözlünk, {user?.name}!</h1>
                <p className="text-gray-600">{user?.school} - {user?.grade}. évfolyam</p>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/help')}>
              <HelpCircle className="w-4 h-4 mr-2" />
              Szerződés Segítő
            </Button>
            {isGuestMode ? (
              <Button onClick={() => router.push('/student')}>
                Bejelentkezés
              </Button>
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
        <div className={`grid gap-6 ${isGuestMode ? 'lg:grid-cols-1' : 'lg:grid-cols-4'}`}>
          {/* Sidebar - Only show for logged-in users */}
          {!isGuestMode && (
            <div className="lg:col-span-1">
              <HourCounter 
                completedHours={user?.completedHours || 0}
                pendingHours={user?.pendingHours || 0}
              />
            </div>
          )}

          {/* Main Content */}
          <div className={isGuestMode ? 'lg:col-span-1' : 'lg:col-span-3'}>
            {/* Help Center Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 mb-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Kell segítség a szerződéshez? 📋</h3>
                  <p className="text-blue-100">
                    Töltsd le a szerződésmintákat, ismerj meg minden jogszabályi követelményt, és kérj segítséget lépésről lépésre.
                  </p>
                </div>
                <Button 
                  variant="secondary" 
                  onClick={() => router.push('/help')}
                  className="bg-white text-blue-700 hover:bg-blue-50"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Szerződés Segítő Központ
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg border p-4 mb-6">
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Keresés lehetőségek között..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <FilterDrawer filters={filters} onFiltersChange={setFilters} />
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
                          distance={isGuestMode ? undefined : Math.random() * 10} // Hide distance for guest users
                          onRequest={handleRequest}
                        />
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="map" className="mt-6">
                  <div className="h-96 rounded-lg overflow-hidden border">
                    <Map 
                      opportunities={filteredOpportunities}
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