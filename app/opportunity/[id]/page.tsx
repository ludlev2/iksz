'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, MapPin, Clock, Users, Calendar, Phone, Mail, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

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

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    const loadOpportunity = async () => {
      try {
        const response = await fetch('/data/mock-opportunities.json');
        const opportunities = await response.json();
        const found = opportunities.find((opp: any) => opp.id === params.id);
        setOpportunity(found);
      } catch (error) {
        console.error('Error loading opportunity:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOpportunity();
  }, [params.id]);

  const handleRequest = () => {
    setHasRequested(true);
    toast.success('Jelentkezés elküldve!', {
      description: 'A szervezővel hamarosan felvesszük a kapcsolatot.'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Betöltés...</div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lehetőség nem található</h2>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Vissza
          </Button>
        </div>
      </div>
    );
  }

  const availableSpots = opportunity.capacity - opportunity.registered;
  const capacityPercentage = (opportunity.registered / opportunity.capacity) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Vissza
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <CardTitle className="text-2xl">{opportunity.title}</CardTitle>
                  <Badge className={categoryColors[opportunity.category] || 'bg-gray-100 text-gray-800'}>
                    {categoryLabels[opportunity.category] || opportunity.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Leírás</h3>
                  <p className="text-gray-700 leading-relaxed">{opportunity.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Részletek</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Helyszín</p>
                        <p className="text-sm text-gray-600">{opportunity.location.address}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Dátum</p>
                        <p className="text-sm text-gray-600">{opportunity.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Időpont</p>
                        <p className="text-sm text-gray-600">{opportunity.time} • {opportunity.duration} óra</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Kapacitás</p>
                        <p className="text-sm text-gray-600">{opportunity.registered}/{opportunity.capacity} fő</p>
                      </div>
                    </div>
                  </div>
                </div>

                {opportunity.requirements && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Követelmények</h3>
                    <p className="text-gray-700">{opportunity.requirements}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Capacity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Jelentkezők</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Jelentkezők száma</span>
                    <span className="font-medium">{opportunity.registered}/{opportunity.capacity}</span>
                  </div>
                  <Progress value={capacityPercentage} className="h-2" />
                  <p className="text-sm text-gray-600">
                    {availableSpots > 0 ? `${availableSpots} hely maradt` : 'Betelt'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Provider Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Szervező</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{opportunity.provider.name}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{opportunity.provider.contact}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{opportunity.provider.phone}</span>
                </div>
              </CardContent>
            </Card>

            {/* Action Button */}
            <Card>
              <CardContent className="pt-6">
                {hasRequested ? (
                  <div className="text-center space-y-3">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                    <div>
                      <p className="font-medium text-green-700">Jelentkezés elküldve!</p>
                      <p className="text-sm text-gray-600">Hamarosan felvesszük veled a kapcsolatot.</p>
                    </div>
                  </div>
                ) : (
                  <Button 
                    onClick={handleRequest}
                    disabled={availableSpots === 0}
                    className="w-full"
                    size="lg"
                  >
                    {availableSpots > 0 ? 'Jelentkezés' : 'Betelt'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}