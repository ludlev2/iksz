'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Calendar,
  Phone,
  Mail,
  Globe,
  CheckCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import type { Opportunity } from '@/lib/opportunity-service';
import { createClient } from '@/utils/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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

const formatTime = (isoDate: string) =>
  new Intl.DateTimeFormat('hu-HU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate));

interface OpportunityDetailClientProps {
  opportunity: Opportunity;
}

export default function OpportunityDetailClient({ opportunity }: OpportunityDetailClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [hasRequested, setHasRequested] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [shiftRegistrations, setShiftRegistrations] = useState<Record<string, number>>({});
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailBody, setEmailBody] = useState('');
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [emailShiftId, setEmailShiftId] = useState<string | null>(null);

  const nextShift = opportunity.nextShift;

  const registeredCount =
    nextShift && shiftRegistrations[nextShift.id] !== undefined
      ? shiftRegistrations[nextShift.id]
      : nextShift?.registeredCount ?? 0;

  const capacity = nextShift?.capacity ?? null;
  const availableSpots = capacity !== null ? Math.max(capacity - registeredCount, 0) : null;
  const capacityPercentage =
    capacity && capacity > 0 ? Math.min((registeredCount / capacity) * 100, 100) : 0;

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

  useEffect(() => {
    const uniqueShiftIds = Array.from(
      new Set((opportunity.shifts ?? []).map((shift) => shift.id)),
    );

    uniqueShiftIds.forEach((shiftId) => {
      refreshShiftRegistration(shiftId);
    });
  }, [opportunity.shifts, refreshShiftRegistration]);

  useEffect(() => {
    const checkExistingApplication = async () => {
      if (!user || !nextShift) {
        return;
      }

      const { data, error } = await supabase
        .from('student_applications')
        .select('id, status')
        .eq('student_id', user.id)
        .eq('shift_id', nextShift.id)
        .in('status', ['pending', 'approved'])
        .maybeSingle();

      if (!error && data) {
        setHasRequested(true);
        setApplicationId(data.id);
      } else {
        setHasRequested(false);
        setApplicationId(null);
      }
    };

    checkExistingApplication();
  }, [nextShift, supabase, user]);

  const openEmailDialog = useCallback((template: string, shiftId: string | null = null) => {
    setEmailBody(template);
    setEmailShiftId(shiftId);
    setEmailDialogOpen(true);
  }, []);

  const handleSendEmail = useCallback(() => {
    if (!opportunity.organizationEmail) {
      toast.error('Ehhez a lehetőséghez nincs megadott email cím.');
      return;
    }

    const subject = `Érdeklődés: ${opportunity.title}`;
    const mailtoLink = `mailto:${encodeURIComponent(
      opportunity.organizationEmail,
    )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

    window.location.href = mailtoLink;
  }, [emailBody, opportunity.organizationEmail, opportunity.title]);

  const handleRequest = async () => {
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

    if (!nextShift) {
      openEmailDialog(
        `Szia ${opportunity.organizationName},\n\nSzeretnék érdeklődni a(z) "${opportunity.title}" lehetőség iránt. ` +
          'Kérlek jelezz vissza, hogy van-e elérhető műszak számomra.\n\nKöszönöm előre is!\n',
        null,
      );
      return;
    }

    if (hasRequested) {
      openEmailDialog(
        `Szia ${opportunity.organizationName},\n\nKorábban jelentkeztem a(z) "${opportunity.title}" lehetőségre a ${formatDate(nextShift.startAt)} időpontban. ` +
          'Szeretném megerősíteni, hogy megkaptátok-e a jelentkezésem.\n\nKöszönöm!\n',
        null,
      );
      return;
    }

    openEmailDialog(
      `Szia ${opportunity.organizationName},\n\n` +
        `Jelentkeztem a(z) "${opportunity.title}" lehetőség ${formatDate(nextShift.startAt)} időpontjára. ` +
        'Kérlek erősítsd meg, hogy megkaptátok, és szólj, ha szükség van további információra.\n\nKöszönöm!\n',
      nextShift.id,
    );
  };

  const handleConfirm = async () => {
    if (!user) {
      toast.error('A jelentkezéshez be kell jelentkezned!', {
        action: {
          label: 'Bejelentkezés',
          onClick: () => router.push('/student'),
        },
      });
      return;
    }

    if (!emailShiftId) {
      toast.error('Nem sikerült azonosítani a műszakot.');
      return;
    }

    setIsConfirming(true);

    try {
      const { data, error } = await supabase
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
                .update({ status: 'pending', submitted_at: new Date().toISOString() })
                .eq('id', existing.id);

              if (updateError) {
                throw updateError;
              }

              toast.success('Jelentkezés újra aktiválva!');
            } else {
              toast.info('Már jelentkeztél erre a műszakra.');
            }

            setHasRequested(true);
            setApplicationId(existing.id);
          }
        } else {
          throw error;
        }
      } else {
        toast.success('Jelentkezés elküldve!', {
          description: `${opportunity.organizationName} hamarosan felveszi veled a kapcsolatot.`,
        });
        setHasRequested(true);
        if (data?.id) {
          setApplicationId(data.id);
        }
      }

      await refreshShiftRegistration(emailShiftId);
      setEmailDialogOpen(false);
      setEmailShiftId(null);
    } catch (error) {
      console.error('Error confirming application:', error);
      toast.error('Nem sikerült elküldeni a jelentkezést.');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = async () => {
    if (!user || !applicationId || !nextShift) {
      toast.error('Nem sikerült azonosítani a jelentkezésedet.');
      return;
    }

    setIsCancelling(true);

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
      setHasRequested(false);
      setApplicationId(null);
      await refreshShiftRegistration(nextShift.id);
    } catch (error) {
      console.error('Error cancelling application:', error);
      toast.error('Nem sikerült lemondani a jelentkezést.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setEmailDialogOpen(open);
    if (!open) {
      setEmailShiftId(null);
    }
  }, []);
  const badgeClass =
    categoryColors[opportunity.category] ?? 'bg-gray-100 text-gray-800';

  const buttonDisabled =
    (availableSpots !== null && availableSpots <= 0) || isConfirming || hasRequested;
  const buttonLabel =
    nextShift && availableSpots === 0
      ? 'Betelt'
      : nextShift
      ? isConfirming
        ? 'Jelentkezés...'
        : hasRequested
        ? 'Már jelentkeztél'
        : 'Jelentkezés'
      : 'Érdeklődés';

  const hoursAwarded =
    nextShift && typeof nextShift.hoursAwarded === 'number'
      ? `${Number.isInteger(nextShift.hoursAwarded) ? nextShift.hoursAwarded.toFixed(0) : nextShift.hoursAwarded.toFixed(1)} óra`
      : 'Időtartam egyeztetés alatt';

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
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <CardTitle className="text-2xl">{opportunity.title}</CardTitle>
                  <Badge className={badgeClass}>
                    {categoryLabels[opportunity.category] || opportunity.categoryLabel}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Leírás</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {opportunity.longDescription || opportunity.description}
                  </p>
                </div>

                {nextShift && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Következő alkalom</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium">Dátum</p>
                          <p className="text-sm text-gray-600">{formatDate(nextShift.startAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium">Időpont</p>
                          <p className="text-sm text-gray-600">
                            {formatTime(nextShift.startAt)} • {hoursAwarded}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-lg mb-3">Helyszín</h3>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{opportunity.location.address}</span>
                  </div>
                </div>

                {opportunity.shifts && opportunity.shifts.length > 1 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Elérhető idősávok</h3>
                    <div className="grid gap-3">
                      {opportunity.shifts.map((shift) => (
                        <div
                          key={shift.id}
                          className="flex items-center justify-between border rounded-lg px-4 py-3"
                        >
                          <div>
                            <p className="font-medium">{formatDate(shift.startAt)}</p>
                            <p className="text-sm text-gray-600">
                              {formatTime(shift.startAt)} •{' '}
                              {typeof shift.hoursAwarded === 'number'
                                ? `${shift.hoursAwarded} óra`
                                : 'Időtartam egyeztetés alatt'}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {shift.status === 'published' ? 'Aktív' : 'Tervezés alatt'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Jelentkezés</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {capacity !== null ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Jelentkezők száma</span>
                      <span className="font-medium">
                        {registeredCount}/{capacity}
                      </span>
                    </div>
                    <Progress value={capacityPercentage} className="h-2" />
                    <p className="text-sm text-gray-600">
                      {availableSpots && availableSpots > 0
                        ? `${availableSpots} hely maradt`
                        : availableSpots === 0
                        ? 'Betelt'
                        : 'Kapacitás egyeztetés alatt'}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-600">
                    Kapacitás egyeztetés alatt. Kérjük érdeklődj a szervezőnél.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Szervező</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-medium">{opportunity.organizationName}</p>
                {opportunity.organizationEmail && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{opportunity.organizationEmail}</span>
                  </div>
                )}
                {opportunity.organizationPhone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{opportunity.organizationPhone}</span>
                  </div>
                )}
                {opportunity.organizationWebsite && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
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
              <CardContent className="pt-6">
                {hasRequested ? (
                  <div className="text-center space-y-3">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                    <div>
                      <p className="font-medium text-green-700">Jelentkezés elküldve!</p>
                      <p className="text-sm text-gray-600">
                        Hamarosan felvesszük veled a kapcsolatot.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() =>
                          openEmailDialog(
                            `Szia ${opportunity.organizationName},\n\n` +
                              `Korábban jelentkeztem a(z) "${opportunity.title}" lehetőségre. ` +
                              'Szeretném megerősíteni, hogy megkapjátok-e a jelentkezésem.\n\nKöszönöm!\n',
                            null,
                          )
                        }
                      >
                        Követő email
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={handleCancel}
                        disabled={isCancelling}
                      >
                        {isCancelling ? 'Lemondás...' : 'Jelentkezés lemondása'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={handleRequest}
                    disabled={buttonDisabled}
                    className="w-full"
                    size="lg"
                  >
                    {buttonLabel}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Dialog open={emailDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kapcsolatfelvétel a szervezővel</DialogTitle>
            <DialogDescription>
              Küldj egy rövid bemutatkozó emailt a szervezőnek. Miután elküldted, térj vissza ide és erősítsd meg az elküldést, hogy rögzíteni tudjuk a jelentkezésed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="dialog-email-to">Címzett</Label>
              <Input
                id="dialog-email-to"
                value={opportunity.organizationEmail ?? ''}
                readOnly
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="dialog-email-body">Üzenet</Label>
              <Textarea
                id="dialog-email-body"
                className="min-h-[200px]"
                value={emailBody}
                onChange={(event) => setEmailBody(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => handleDialogOpenChange(false)}>
              Bezárás
            </Button>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="secondary"
                onClick={handleSendEmail}
                disabled={!opportunity.organizationEmail}
              >
                {opportunity.organizationEmail ? 'Email megnyitása' : 'Nem elérhető'}
              </Button>
              {emailShiftId && !hasRequested && (
                <Button onClick={handleConfirm} disabled={isConfirming}>
                  {isConfirming ? 'Megerősítés...' : 'Elküldtem az emailt'}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
