'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users, Calendar, Heart } from 'lucide-react';
interface OpportunityCardProps {
  opportunity: {
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
    nextShift?: {
      id: string;
      startAt: string;
      endAt: string;
      hoursAwarded?: number;
      capacity?: number;
      registeredCount?: number;
    };
  };
  distance?: number;
  onRequest?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string, nextValue: boolean) => void;
  favoriteDisabled?: boolean;
  signupDisabled?: boolean;
  hasPendingApplication?: boolean;
}

const categoryColors: Record<string, string> = {
  environment: 'bg-green-100 text-green-800',
  elderly: 'bg-purple-100 text-purple-800',
  animals: 'bg-orange-100 text-orange-800',
  children: 'bg-pink-100 text-pink-800',
  social: 'bg-blue-100 text-blue-800',
  education: 'bg-indigo-100 text-indigo-800',
  other: 'bg-gray-100 text-gray-800',
};

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

export default function OpportunityCard({
  opportunity,
  distance,
  onRequest,
  onViewDetails,
  isFavorite = false,
  onToggleFavorite,
  favoriteDisabled = false,
  signupDisabled = false,
  hasPendingApplication = false,
}: OpportunityCardProps) {
  const handleRequest = () => {
    onRequest?.(opportunity.id);
  };

  const handleViewDetails = () => {
    onViewDetails?.(opportunity.id);
  };

  const handleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(opportunity.id, !isFavorite);
    }
  };

  const nextShift = opportunity.nextShift;
  const shiftStart = nextShift ? new Date(nextShift.startAt) : null;
  const shiftEnd = nextShift?.endAt ? new Date(nextShift.endAt) : null;

  let durationHours: number | null = null;
  if (nextShift) {
    if (typeof nextShift.hoursAwarded === 'number') {
      durationHours = nextShift.hoursAwarded;
    } else if (shiftStart && shiftEnd) {
      durationHours = Number(((shiftEnd.getTime() - shiftStart.getTime()) / (1000 * 60 * 60)).toFixed(1));
    }
  }

  const capacity =
    nextShift && typeof nextShift.capacity === 'number' ? nextShift.capacity : null;
  const registered =
    nextShift && typeof nextShift.registeredCount === 'number' ? nextShift.registeredCount : 0;
  const availableSpots = capacity !== null ? capacity - registered : null;

  const badgeClass =
    categoryColors[opportunity.category] ?? categoryColors.other;

  const availabilityBadge =
    availableSpots === null
      ? 'bg-blue-100 text-blue-700'
      : availableSpots > 5
      ? 'bg-green-100 text-green-700'
      : availableSpots > 0
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-red-100 text-red-700';

  const availabilityText =
    availableSpots === null
      ? 'Elérhetőség egyeztetés alatt'
      : availableSpots > 0
      ? `${availableSpots} hely`
      : 'Betelt';

  const buttonDisabled =
    (availableSpots !== null && availableSpots <= 0) || signupDisabled || hasPendingApplication;

  const baseButtonLabel =
    nextShift && availableSpots === 0
      ? 'Betelt'
      : nextShift
      ? hasPendingApplication
        ? 'Jelentkezés elküldve'
        : 'Jelentkezem'
      : 'Érdeklődés';
  const buttonLabel =
    signupDisabled && baseButtonLabel === 'Jelentkezem' ? 'Jelentkezés...' : baseButtonLabel;
  const favoriteLabel = isFavorite ? 'Eltávolítás' : 'Mentés';
  const favoriteVariant = isFavorite ? 'secondary' : 'outline-solid';
  const actionLayoutClass = onToggleFavorite
    ? 'pt-2 grid gap-2 sm:grid-cols-3'
    : 'pt-2 grid gap-2 sm:grid-cols-2';

  const formattedDuration =
    durationHours !== null
      ? `${Number.isInteger(durationHours) ? durationHours.toFixed(0) : durationHours.toFixed(1)} óra`
      : 'Időtartam egyeztetés alatt';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <CardTitle className="text-lg leading-tight">{opportunity.title}</CardTitle>
          <Badge className={badgeClass}>
            {opportunity.categoryLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {opportunity.description || 'A szervező később ad meg részleteket.'}
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{opportunity.location.address}</span>
            {typeof distance === 'number' && (
              <span className="text-blue-600">• {distance.toFixed(1)} km</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              {shiftStart ? formatDate(nextShift!.startAt) : 'Időpont egyeztetés alatt'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              {shiftStart ? formatTime(nextShift!.startAt) : '—'} • {formattedDuration}
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>
              {capacity !== null ? `${registered}/${capacity} jelentkező` : 'Kapacitás egyeztetés alatt'}
            </span>
            <span className={`text-xs px-2 py-1 rounded ${availabilityBadge}`}>
              {availabilityText}
            </span>
          </div>
        </div>

        <div className={actionLayoutClass}>
          {onToggleFavorite && (
            <Button
              onClick={handleFavorite}
              variant={favoriteVariant}
              className="flex-1"
              size="sm"
              disabled={favoriteDisabled}
            >
              <Heart className="w-4 h-4 mr-2" fill={isFavorite ? 'currentColor' : 'none'} />
              {favoriteLabel}
            </Button>
          )}
          <Button
            onClick={handleViewDetails}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            Részletek
          </Button>
          <Button
            onClick={handleRequest}
            disabled={buttonDisabled}
            className="flex-1"
            size="sm"
          >
            {buttonLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
