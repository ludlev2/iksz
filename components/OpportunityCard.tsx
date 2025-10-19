'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Heart, Mail } from 'lucide-react';
import type { Opportunity } from '@/lib/opportunity-service';
interface OpportunityCardProps {
  opportunity: Opportunity;
  distance?: number;
  onContact?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string, nextValue: boolean) => void;
  favoriteDisabled?: boolean;
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

export default function OpportunityCard({
  opportunity,
  distance,
  onContact,
  onViewDetails,
  isFavorite = false,
  onToggleFavorite,
  favoriteDisabled = false,
}: OpportunityCardProps) {
  const handleContact = () => {
    onContact?.(opportunity.id);
  };

  const handleViewDetails = () => {
    onViewDetails?.(opportunity.id);
  };

  const handleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(opportunity.id, !isFavorite);
    }
  };

  const badgeClass =
    categoryColors[opportunity.category] ?? categoryColors.other;

  const favoriteLabel = isFavorite ? 'Eltávolítás' : 'Mentés';
  const favoriteVariant = isFavorite ? 'secondary' : 'outline-solid';
  const hasFavoriteAction = Boolean(onToggleFavorite);
  const hasContactAction = Boolean(onContact);
  const actionLayoutClass = [
    'pt-2 grid gap-2',
    hasFavoriteAction && hasContactAction
      ? 'sm:grid-cols-3'
      : hasFavoriteAction || hasContactAction
      ? 'sm:grid-cols-2'
      : 'sm:grid-cols-1',
  ].join(' ');

  const deadlineLabel = opportunity.deadline
    ? formatDate(opportunity.deadline)
    : 'Nincs határidő megadva';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg leading-tight break-words">
              {opportunity.title}
            </CardTitle>
            {isFavorite && (
              <Badge className="bg-yellow-100 text-yellow-800 border-transparent w-fit">
                Mentve
              </Badge>
            )}
          </div>
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
          <div className="text-muted-foreground">
            {opportunity.organizationName}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{opportunity.location.address}</span>
            {typeof distance === 'number' && (
              <span className="text-blue-600">• {distance.toFixed(1)} km</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{deadlineLabel}</span>
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
          {onContact && (
            <Button
              onClick={handleContact}
              className="flex-1"
              size="sm"
            >
              <Mail className="w-4 h-4 mr-2" />
              Kapcsolat
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
