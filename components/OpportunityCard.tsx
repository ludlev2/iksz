'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface OpportunityCardProps {
  opportunity: {
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
    };
  };
  distance?: number;
  onRequest?: (id: string) => void;
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

export default function OpportunityCard({ opportunity, distance, onRequest }: OpportunityCardProps) {
  const handleRequest = () => {
    if (onRequest) {
      onRequest(opportunity.id);
    }
    toast.success('Jelentkezés elküldve!', {
      description: 'A szervezővel hamarosan felvesszük a kapcsolatot.'
    });
  };

  const availableSpots = opportunity.capacity - opportunity.registered;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <CardTitle className="text-lg leading-tight">{opportunity.title}</CardTitle>
          <Badge className={categoryColors[opportunity.category] || 'bg-gray-100 text-gray-800'}>
            {categoryLabels[opportunity.category] || opportunity.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {opportunity.description}
        </p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{opportunity.location.address}</span>
            {distance && <span className="text-blue-600">• {distance.toFixed(1)} km</span>}
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{opportunity.date}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{opportunity.time} • {opportunity.duration} óra</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{opportunity.registered}/{opportunity.capacity} jelentkező</span>
            <span className={`text-xs px-2 py-1 rounded ${
              availableSpots > 5 ? 'bg-green-100 text-green-700' :
              availableSpots > 0 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {availableSpots > 0 ? `${availableSpots} hely` : 'Betelt'}
            </span>
          </div>
        </div>

        <div className="pt-2">
          <Button 
            onClick={handleRequest}
            disabled={availableSpots === 0}
            className="w-full"
            size="sm"
          >
            {availableSpots > 0 ? 'Jelentkezés' : 'Betelt'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}