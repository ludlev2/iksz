'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type SubmissionStatus = 'pending' | 'approved' | 'rejected';

type Submission = {
  id: string;
  status: SubmissionStatus;
  submitter_name: string;
  submitter_email: string;
  submitter_role: string;
  organization_name: string;
  contact_name: string | null;
  contact_email: string;
  contact_phone: string | null;
  opportunity_title: string;
  opportunity_description: string | null;
  location_address: string;
  city: string | null;
  shift_dates: string;
  expected_hours: number | null;
  capacity: number | null;
  additional_notes: string | null;
  created_at: string;
  reviewer_id: string | null;
  review_notes: string | null;
};

type EditFormState = {
  organizationName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  opportunityTitle: string;
  opportunityDescription: string;
  locationAddress: string;
  city: string;
  shiftDates: string;
  expectedHours: string;
  capacity: string;
  additionalNotes: string;
  moderationNotes: string;
  shiftStart: string;
  shiftEnd: string;
};

const statusLabels: Record<SubmissionStatus, { label: string; className: string }> = {
  pending: { label: 'Folyamatban', className: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Jóváhagyva', className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Elutasítva', className: 'bg-red-100 text-red-700' },
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'szervezet';

export default function ModerationDashboardPage() {
  const { user, isLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SubmissionStatus>('pending');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const isReviewer = !!user && user.role === 'admin';

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('submitted_opportunities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        console.error('Error loading submissions:', error);
        toast.error('Nem sikerült betölteni a beküldéseket.');
      } else {
        setSubmissions(data ?? []);
      }

      setLoading(false);
    };

    if (isReviewer) {
      fetchSubmissions();
    } else {
      setLoading(false);
    }
  }, [isReviewer, supabase]);

  const filteredSubmissions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return submissions.filter((submission) => {
      if (statusFilter !== 'all' && submission.status !== statusFilter) {
        return false;
      }
      if (!term) {
        return true;
      }
      return (
        submission.opportunity_title.toLowerCase().includes(term) ||
        submission.organization_name.toLowerCase().includes(term) ||
        submission.submitter_name.toLowerCase().includes(term)
      );
    });
  }, [searchTerm, statusFilter, submissions]);

  const updateForm = (field: keyof EditFormState, value: string) => {
    setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const openEditor = (submission: Submission) => {
    setEditingSubmission(submission);
    setEditForm({
      organizationName: submission.organization_name,
      contactName: submission.contact_name ?? '',
      contactEmail: submission.contact_email,
      contactPhone: submission.contact_phone ?? '',
      opportunityTitle: submission.opportunity_title,
      opportunityDescription: submission.opportunity_description ?? '',
      locationAddress: submission.location_address,
      city: submission.city ?? '',
      shiftDates: submission.shift_dates,
      expectedHours: submission.expected_hours !== null ? String(submission.expected_hours) : '',
      capacity: submission.capacity !== null ? String(submission.capacity) : '',
      additionalNotes: submission.additional_notes ?? '',
      moderationNotes: submission.review_notes ?? '',
      shiftStart: '',
      shiftEnd: '',
    });
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingSubmission(null);
    setEditForm(null);
    setSaving(false);
    setPublishing(false);
  };

  const handleUpdateStatus = async (id: string, status: SubmissionStatus) => {
    if (!user) {
      toast.error('A módosításhoz be kell jelentkezned.');
      return;
    }

    setUpdatingId(id);

    const { error } = await supabase
      .from('submitted_opportunities')
      .update({
        status,
        reviewer_id: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating submission status:', error);
      toast.error('Nem sikerült frissíteni az állapotot.');
      setUpdatingId(null);
      return;
    }

    setSubmissions((previous) =>
      previous.map((submission) =>
        submission.id === id ? { ...submission, status, reviewer_id: user.id } : submission,
      ),
    );
    toast.success(status === 'approved' ? 'Feladat jóváhagyva!' : 'Feladat elutasítva.');
    setUpdatingId(null);
  };

  const handleSaveEdits = async (showToast = true) => {
    if (!editingSubmission || !editForm) {
      return false;
    }

    setSaving(true);

    const expectedHours = editForm.expectedHours ? Number(editForm.expectedHours) : null;
    const capacity = editForm.capacity ? Number.parseInt(editForm.capacity, 10) : null;

    const { error } = await supabase
      .from('submitted_opportunities')
      .update({
        organization_name: editForm.organizationName,
        contact_name: editForm.contactName || null,
        contact_email: editForm.contactEmail,
        contact_phone: editForm.contactPhone || null,
        opportunity_title: editForm.opportunityTitle,
        opportunity_description: editForm.opportunityDescription || null,
        location_address: editForm.locationAddress,
        city: editForm.city || null,
        shift_dates: editForm.shiftDates,
        expected_hours: expectedHours,
        capacity,
        additional_notes: editForm.additionalNotes || null,
        review_notes: editForm.moderationNotes || null,
      })
      .eq('id', editingSubmission.id);

    if (error) {
      console.error('Error updating submission:', error);
      toast.error('Nem sikerült frissíteni a beküldést.');
      setSaving(false);
      return false;
    }

    setSubmissions((previous) =>
      previous.map((submission) =>
        submission.id === editingSubmission.id
          ? {
              ...submission,
              organization_name: editForm.organizationName,
              contact_name: editForm.contactName || null,
              contact_email: editForm.contactEmail,
              contact_phone: editForm.contactPhone || null,
              opportunity_title: editForm.opportunityTitle,
              opportunity_description: editForm.opportunityDescription || null,
              location_address: editForm.locationAddress,
              city: editForm.city || null,
              shift_dates: editForm.shiftDates,
              expected_hours: expectedHours,
              capacity,
              additional_notes: editForm.additionalNotes || null,
              review_notes: editForm.moderationNotes || null,
            }
          : submission,
      ),
    );

    if (showToast) {
      toast.success('Beküldés frissítve.');
    }

    setSaving(false);
    return true;
  };

  const handlePublish = async () => {
    if (!user) {
      toast.error('A jóváhagyáshoz be kell jelentkezned.');
      return;
    }
    if (!editingSubmission || !editForm) {
      toast.error('Nincs kiválasztott beküldés.');
      return;
    }

    const saved = await handleSaveEdits(false);
    if (!saved) {
      return;
    }

    setPublishing(true);

    try {
      const slug = slugify(editForm.organizationName);
      let organizationId: string | undefined;

      const { data: existingOrg, error: existingOrgError } = await supabase
        .from('organization_profiles')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (existingOrgError) {
        throw existingOrgError;
      }

      if (existingOrg?.id) {
        organizationId = existingOrg.id;
      } else {
        const { data: insertedOrg, error: insertOrgError } = await supabase
          .from('organization_profiles')
          .insert({
            name: editForm.organizationName,
            slug,
            email: editForm.contactEmail,
            phone: editForm.contactPhone || null,
            address: editForm.locationAddress,
            city: editForm.city || null,
          })
          .select('id')
          .maybeSingle();

        if (insertOrgError) {
          throw insertOrgError;
        }

        organizationId = insertedOrg?.id;
      }

      if (!organizationId) {
        throw new Error('Nem sikerült létrehozni a fogadó szervezetet.');
      }

      const now = new Date().toISOString();
      const shortDescription =
        editForm.opportunityDescription?.slice(0, 160) ??
        editForm.opportunityDescription ??
        null;

      const { data: insertedOpportunity, error: insertOpportunityError } = await supabase
        .from('opportunities')
        .insert({
          organization_id: organizationId,
          title: editForm.opportunityTitle,
          short_description: shortDescription,
          description: editForm.opportunityDescription || null,
          address: editForm.locationAddress,
          city: editForm.city || null,
          published: true,
          published_at: now,
          created_by: user.id,
        })
        .select('id')
        .maybeSingle();

      if (insertOpportunityError) {
        throw insertOpportunityError;
      }

      const opportunityId = insertedOpportunity?.id;
      const expectedHours = editForm.expectedHours ? Number(editForm.expectedHours) : null;
      const capacity = editForm.capacity ? Number.parseInt(editForm.capacity, 10) : null;

      let startAt = editForm.shiftStart ? new Date(editForm.shiftStart).toISOString() : null;
      let endAt = editForm.shiftEnd ? new Date(editForm.shiftEnd).toISOString() : null;

      if (opportunityId) {
        if (startAt || endAt || expectedHours !== null || capacity !== null) {
          if (!startAt) {
            startAt = now;
          }
          if (!endAt) {
            endAt = startAt;
          }

          const { error: shiftError } = await supabase.from('opportunity_shifts').insert({
            opportunity_id: opportunityId,
            start_at: startAt,
            end_at: endAt,
            hours_awarded: expectedHours,
            capacity,
            status: 'published',
          });

          if (shiftError) {
            throw shiftError;
          }
        }
      }

      const { error: updateStatusError } = await supabase
        .from('submitted_opportunities')
        .update({
          status: 'approved',
          review_notes: editForm.moderationNotes || null,
          reviewer_id: user.id,
          reviewed_at: now,
        })
        .eq('id', editingSubmission.id);

      if (updateStatusError) {
        throw updateStatusError;
      }

      setSubmissions((previous) =>
        previous.map((submission) =>
          submission.id === editingSubmission.id
            ? {
                ...submission,
                status: 'approved',
                review_notes: editForm.moderationNotes || null,
                reviewer_id: user.id,
              }
            : submission,
        ),
      );

      toast.success('Feladat jóváhagyva és publikálva!');
      closeEditor();
    } catch (error) {
      console.error('Error publishing submission:', error);
      toast.error('Nem sikerült publikálni a feladatot. Ellenőrizd az adatokat, majd próbáld újra.');
    } finally {
      setPublishing(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-slate-500">Beküldések betöltése…</p>
      </div>
    );
  }

  if (!isReviewer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Moderációs felület</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              Ehhez a felülethez csak admin jogosultsággal lehet hozzáférni. Ha szerinted jogosult lennél, vedd fel velünk a kapcsolatot.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-6xl space-y-6 px-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Beküldött feladatok</h1>
            <p className="mt-2 text-sm text-slate-500">
              Átnézésre váró és korábban ellenőrzött lehetőségek. Jóváhagyás után a feladat automatikusan megjelenik a diákok számára.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/student/dashboard')}>
            Vissza a diák nézethez
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Beküldések: {submissions.length} • Megjelenítve: {filteredSubmissions.length}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              placeholder="Keresés feladat / szervezet szerint…"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full sm:w-72"
            />
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as 'all' | SubmissionStatus)}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Állapot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Összes</SelectItem>
                <SelectItem value="pending">Folyamatban</SelectItem>
                <SelectItem value="approved">Jóváhagyva</SelectItem>
                <SelectItem value="rejected">Elutasítva</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredSubmissions.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Nincs megjeleníthető beküldés</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                Próbálj meg másik keresőkifejezést vagy állapot szűrőt használni.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => {
              const statusMeta = statusLabels[submission.status];
              return (
                <Card key={submission.id}>
                  <CardHeader className="flex flex-col gap-2 border-b border-slate-100 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <CardTitle>{submission.opportunity_title}</CardTitle>
                        <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
                      </div>
                      <p className="text-sm text-slate-500">
                        Beküldő: {submission.submitter_name} (
                        {submission.submitter_role === 'student' ? 'diák' : 'tanár'}) •{' '}
                        <a
                          href={`mailto:${submission.submitter_email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {submission.submitter_email}
                        </a>
                      </p>
                      <p className="text-xs text-slate-400">
                        Beküldve: {format(new Date(submission.created_at), 'yyyy.MM.dd. HH:mm')}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditor(submission)}>
                        Szerkesztés
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={updatingId === submission.id || submission.status === 'approved'}
                        onClick={() => handleUpdateStatus(submission.id, 'approved')}
                      >
                        Jóváhagyás
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={updatingId === submission.id || submission.status === 'rejected'}
                        onClick={() => handleUpdateStatus(submission.id, 'rejected')}
                      >
                        Elutasítás
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase text-slate-500">Szervezet</p>
                        <p className="text-sm text-slate-700">{submission.organization_name}</p>
                        <p className="text-xs text-slate-500">
                          Kapcsolattartó: {submission.contact_name ?? '—'}
                        </p>
                        <p className="text-xs">
                          Email:{' '}
                          <a
                            href={`mailto:${submission.contact_email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {submission.contact_email}
                          </a>
                        </p>
                        {submission.contact_phone && (
                          <p className="text-xs text-slate-500">Telefon: {submission.contact_phone}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase text-slate-500">Helyszín</p>
                        <p className="text-sm text-slate-700">
                          {submission.location_address}
                          {submission.city ? `, ${submission.city}` : ''}
                        </p>
                        <p className="text-xs text-slate-500">Időpont(ok): {submission.shift_dates}</p>
                        <p className="text-xs text-slate-500">
                          Várható óraszám: {submission.expected_hours !== null ? `${submission.expected_hours} óra` : '—'}
                        </p>
                        <p className="text-xs text-slate-500">
                          Kapacitás: {submission.capacity !== null ? `${submission.capacity} fő` : '—'}
                        </p>
                      </div>
                    </div>

                    {submission.opportunity_description && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase text-slate-500">Leírás</p>
                        <p className="whitespace-pre-wrap text-sm text-slate-700">
                          {submission.opportunity_description}
                        </p>
                      </div>
                    )}

                    {submission.additional_notes && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase text-slate-500">
                          Beküldő megjegyzése
                        </p>
                        <p className="whitespace-pre-wrap text-sm text-slate-600">
                          {submission.additional_notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={editorOpen} onOpenChange={(open) => (open ? null : closeEditor())}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Beküldés szerkesztése</DialogTitle>
            <DialogDescription>
              Frissítsd a beküldött adatokat, majd publikáld a feladatot, hogy megjelenjen a diákok számára.
            </DialogDescription>
          </DialogHeader>
          {editForm ? (
            <div className="space-y-6">
              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase text-slate-500">Szervezet és kapcsolattartó</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="editor-organization">Szervezet neve</Label>
                    <Input
                      id="editor-organization"
                      value={editForm.organizationName}
                      onChange={(event) => updateForm('organizationName', event.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="editor-contact-name">Kapcsolattartó</Label>
                    <Input
                      id="editor-contact-name"
                      value={editForm.contactName}
                      onChange={(event) => updateForm('contactName', event.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="editor-contact-email">Kapcsolattartó email</Label>
                    <Input
                      id="editor-contact-email"
                      type="email"
                      value={editForm.contactEmail}
                      onChange={(event) => updateForm('contactEmail', event.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="editor-contact-phone">Kapcsolattartó telefon</Label>
                    <Input
                      id="editor-contact-phone"
                      value={editForm.contactPhone}
                      onChange={(event) => updateForm('contactPhone', event.target.value)}
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase text-slate-500">Feladat részletei</h3>
                <div className="space-y-1.5">
                  <Label htmlFor="editor-title">Feladat címe</Label>
                  <Input
                    id="editor-title"
                    value={editForm.opportunityTitle}
                    onChange={(event) => updateForm('opportunityTitle', event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="editor-description">Leírás</Label>
                  <Textarea
                    id="editor-description"
                    rows={5}
                    value={editForm.opportunityDescription}
                    onChange={(event) => updateForm('opportunityDescription', event.target.value)}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="editor-address">Cím</Label>
                    <Input
                      id="editor-address"
                      value={editForm.locationAddress}
                      onChange={(event) => updateForm('locationAddress', event.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="editor-city">Város</Label>
                    <Input
                      id="editor-city"
                      value={editForm.city}
                      onChange={(event) => updateForm('city', event.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="editor-shift-dates">Tervezett időpont(ok)</Label>
                  <Input
                    id="editor-shift-dates"
                    value={editForm.shiftDates}
                    onChange={(event) => updateForm('shiftDates', event.target.value)}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="editor-expected-hours">Várható óraszám</Label>
                    <Input
                      id="editor-expected-hours"
                      type="number"
                      value={editForm.expectedHours}
                      onChange={(event) => updateForm('expectedHours', event.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="editor-capacity">Férőhely</Label>
                    <Input
                      id="editor-capacity"
                      type="number"
                      value={editForm.capacity}
                      onChange={(event) => updateForm('capacity', event.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="editor-shift-start">Kezdés időpontja</Label>
                    <Input
                      id="editor-shift-start"
                      type="datetime-local"
                      value={editForm.shiftStart}
                      onChange={(event) => updateForm('shiftStart', event.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="editor-shift-end">Befejezés időpontja</Label>
                    <Input
                      id="editor-shift-end"
                      type="datetime-local"
                      value={editForm.shiftEnd}
                      onChange={(event) => updateForm('shiftEnd', event.target.value)}
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase text-slate-500">Jegyzetek</h3>
                <div className="space-y-1.5">
                  <Label htmlFor="editor-additional-notes">Beküldő megjegyzése</Label>
                  <Textarea
                    id="editor-additional-notes"
                    rows={3}
                    value={editForm.additionalNotes}
                    onChange={(event) => updateForm('additionalNotes', event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="editor-moderation-notes">Moderációs jegyzet</Label>
                  <Textarea
                    id="editor-moderation-notes"
                    rows={3}
                    value={editForm.moderationNotes}
                    onChange={(event) => updateForm('moderationNotes', event.target.value)}
                  />
                </div>
              </section>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Nincs kiválasztott beküldés.</p>
          )}
          <DialogFooter className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" onClick={() => handleSaveEdits()} disabled={saving || publishing}>
              Változások mentése
            </Button>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="secondary" onClick={handlePublish} disabled={publishing || saving}>
                {publishing ? 'Publikálás…' : 'Jóváhagyás és publikálás'}
              </Button>
              <Button variant="ghost" onClick={closeEditor}>
                Bezárás
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
