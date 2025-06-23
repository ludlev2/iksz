'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, LogOut, Users, Calendar, MapPin, Clock, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  category: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  date: string;
  time: string;
  duration: number;
  capacity: number;
  registered: number;
  provider: {
    name: string;
    contact: string;
    phone: string;
  };
  requirements?: string;
  status: string;
}

const categoryLabels: Record<string, string> = {
  environment: 'Környezetvédelem',
  elderly: 'Idősek segítése',
  animals: 'Állatvédelem',
  children: 'Gyermekek',
  social: 'Szociális',
  education: 'Oktatás'
};

const categoryColors: Record<string, string> = {
  environment: 'bg-green-100 text-green-800',
  elderly: 'bg-purple-100 text-purple-800',
  animals: 'bg-orange-100 text-orange-800',
  children: 'bg-pink-100 text-pink-800',
  social: 'bg-blue-100 text-blue-800',
  education: 'bg-indigo-100 text-indigo-800'
};

export default function ProviderDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'provider') {
      router.push('/login');
      return;
    }

    // Load opportunities
    fetch('/data/mock-opportunities.json')
      .then(res => res.json())
      .then((data: Opportunity[]) => {
        // Filter opportunities for this provider
        const providerOpportunities = data.filter(opp => 
          opp.provider.name === user.organization
        );
        setOpportunities(providerOpportunities);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error loading opportunities:', err);
        setIsLoading(false);
      });
  }, [user, router]);

  const handleDeleteOpportunity = (opportunityId: string) => {
    setOpportunities(prev => prev.filter(opp => opp.id !== opportunityId));
    toast.success('Lehetőség törölve!');
  };

  if (isLoading) {
    return <div>Betöltés...</div>;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  const totalCapacity = opportunities.reduce((sum, opp) => sum + opp.capacity, 0);
  const totalRegistered = opportunities.reduce((sum, opp) => sum + opp.registered, 0);
  const activeOpportunities = opportunities.filter(opp => opp.status === 'active').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Szervező dashboard</h1>
            <p className="text-gray-600">{user.name} - {user.organization}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/provider/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Új lehetőség
              </Button>
            </Link>
            <Button variant="outline" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Kijelentkezés
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aktív lehetőségek</p>
                  <p className="text-2xl font-bold text-blue-600">{activeOpportunities}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Összes jelentkező</p>
                  <p className="text-2xl font-bold text-green-600">{totalRegistered}</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Összes kapacitás</p>
                  <p className="text-2xl font-bold text-purple-600">{totalCapacity}</p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Kihasználtság</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {totalCapacity > 0 ? Math.round((totalRegistered / totalCapacity) * 100) : 0}%
                  </p>
                </div>
                <Progress 
                  value={totalCapacity > 0 ? (totalRegistered / totalCapacity) * 100 : 0} 
                  className="w-8 h-2" 
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Opportunities List */}
        <Card>
          <CardHeader>
            <CardTitle>Lehetőségeim</CardTitle>
          </CardHeader>
          <CardContent>
            {opportunities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Még nincs létrehozott lehetőséged.</p>
                <Link href="/provider/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Első lehetőség létrehozása
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {opportunities.map((opportunity) => {
                  const availableSpots = opportunity.capacity - opportunity.registered;
                  const capacityPercentage = (opportunity.registered / opportunity.capacity) * 100;

                  return (
                    <div key={opportunity.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{opportunity.title}</h3>
                            <Badge className={categoryColors[opportunity.category] || 'bg-gray-100 text-gray-800'}>
                              {categoryLabels[opportunity.category] || opportunity.category}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{opportunity.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteOpportunity(opportunity.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{opportunity.location.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{opportunity.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{opportunity.time} • {opportunity.duration}h</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{opportunity.registered}/{opportunity.capacity} fő</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Jelentkezők</span>
                          <span className="font-medium">{opportunity.registered}/{opportunity.capacity}</span>
                        </div>
                        <Progress value={capacityPercentage} className="h-2" />
                        <p className="text-sm text-gray-600">
                          {availableSpots > 0 ? `${availableSpots} hely maradt` : 'Betelt'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}