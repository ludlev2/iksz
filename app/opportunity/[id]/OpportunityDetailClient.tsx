'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Globe,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Opportunity } from '@/lib/opportunity-service';

const categoryLabels: Record<string, string> = {
  environment: 'Környezetvédelem',
  elderly: 'Idősek segítése',
  animals: 'Állatvédelem',
  children: 'Gyermekek',
  social: 'Szociális',
  education: 'Oktatás',
};

const categoryColors: Record<string, string> = {
  environment: 'bg-green-100 text-green-800',
  elderly: 'bg-purple-100 text-purple-800',
  animals: 'bg-orange-100 text-orange-800',
  children: 'bg-pink-100 text-pink-800',
  social: 'bg-blue-100 text-blue-800',
  education: 'bg-indigo-100 text-indigo-800',
};

const formatDate = (isoDate: string) =>
  new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(isoDate));

const formatDeadline = (deadline?: string | null) => {
  if (!deadline) {
    return 'Határidő egyeztetés alatt';
  }
  return formatDate(deadline);
};

interface OpportunityDetailClientProps {
  opportunity: Opportunity;
}

export default function OpportunityDetailClient({ opportunity }: OpportunityDetailClientProps) {
  const router = useRouter();

  const handleOpenEmail = useCallback(() => {
    if (!opportunity.organizationEmail) {
      toast.info('Ehhez a lehetőséghez nem található email cím. Vedd fel a kapcsolatot más elérhetőségen!');
      return;
    }

    const subject = `Érdeklődés: ${opportunity.title}`;
    const deadlineNote = opportunity.deadline
      ? `A megadott határidő: ${formatDate(opportunity.deadline)}. `
      : '';

    const body = [
      `Szia ${opportunity.organizationName},`,
      '',
      `Érdeklődöm a(z) "${opportunity.title}" lehetőség iránt. ${deadlineNote}Kérlek jelezd, hogyan tudok csatlakozni, illetve van-e további információ, amire szükség van.`,
      '',
      'Köszönöm előre is!',
    ].join('\n');

    const mailtoLink = `mailto:${encodeURIComponent(
      opportunity.organizationEmail,
    )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;
  }, [opportunity.organizationEmail, opportunity.organizationName, opportunity.deadline, opportunity.title]);

  const badgeClass =
    categoryColors[opportunity.category] ?? 'bg-gray-100 text-gray-800';
  const deadlineLabel = formatDeadline(opportunity.deadline);
  const description =
    opportunity.longDescription ??
    opportunity.description ??
    'A szervező később ad meg részleteket.';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Vissza
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">{opportunity.title}</CardTitle>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {opportunity.organizationName}
                    </p>
                  </div>
                  <Badge className={badgeClass}>
                    {categoryLabels[opportunity.category] ?? opportunity.categoryLabel}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Leírás</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {description}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Fontos információk</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-sm text-gray-900">Határidő</p>
                        <p className="text-sm text-muted-foreground">{deadlineLabel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <MapPin className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-sm text-gray-900">Helyszín</p>
                        <p className="text-sm text-muted-foreground">
                          {opportunity.location.address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kapcsolati adatok</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {opportunity.organizationEmail ? (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{opportunity.organizationEmail}</span>
                  </div>
                ) : (
                  <p>Email cím nincs megadva</p>
                )}
                {opportunity.organizationPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{opportunity.organizationPhone}</span>
                  </div>
                )}
                {opportunity.organizationWebsite && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <a
                      href={opportunity.organizationWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Weboldal megnyitása
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">Kapcsolatfelvétel</h3>
                  <p className="text-sm text-muted-foreground">
                    Írj egy rövid bemutatkozó emailt a szervezőnek, és érdeklődj a következő lépésekről.
                  </p>
                </div>
                <Button
                  onClick={handleOpenEmail}
                  size="lg"
                  className="w-full"
                  disabled={!opportunity.organizationEmail}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email küldése
                </Button>
                {!opportunity.organizationEmail && (
                  <p className="text-xs text-muted-foreground">
                    Ehhez a lehetőséghez nincs email cím megadva. Használd a telefonszámot vagy weboldalt!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
