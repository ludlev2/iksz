'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Map as MapIcon, List, LogOut } from 'lucide-react';
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
  const { user, logout } = useAuth();
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
    if (!user || user.role !== 'student') {
      router.push('/login');
      return;
    }

    // Load opportunities
    fetch('/data/mock-opportunities.json')
      .then(res => res.json())
      .then((data: Opportunity[]) => {
        setOpportunities(data);
        setFilteredOpportunities(data);
      })
      .catch(err => console.error('Error loading opportunities:', err));
  }, [user, router]);

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
    // Mock request logic
    console.log('Requesting opportunity:', opportunityId);
  };

  const handleMarkerClick = (opportunityId: string) => {
    router.push(`/opportunity/${opportunityId}`);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Üdvözlünk, {user.name}!</h1>
            <p className="text-gray-600">{user.school} - {user.grade}. évfolyam</p>
          </div>
          <Button variant="outline" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Kijelentkezés
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <HourCounter 
              completedHours={user.completedHours || 0}
              pendingHours={user.pendingHours || 0}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
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
                          distance={Math.random() * 10} // Mock distance
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