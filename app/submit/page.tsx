'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const submissionSchema = z.object({
  submitterName: z.string().min(2, 'Add meg a nevedet.'),
  submitterEmail: z.string().email('Érvényes email címet adj meg.'),
  submitterRole: z.enum(['student', 'teacher'], {
    errorMap: () => ({ message: 'Válaszd ki a szerepkörödet.' }),
  }),
  organizationName: z.string().min(2, 'Add meg a fogadó szervezet nevét.'),
  contactName: z.string().min(2, 'Add meg a kapcsolattartó nevét.'),
  contactEmail: z.string().email('Érvényes kapcsolattartói email címet adj meg.'),
  contactPhone: z.string().min(6, 'Adj meg egy telefonszámot.'),
  opportunityTitle: z.string().min(3, 'Adj meg egy rövid címet a feladathoz.'),
  opportunityDescription: z
    .string()
    .min(10, 'Írj egy rövid leírást a feladatról (minimum 10 karakter).'),
  locationAddress: z.string().min(3, 'Add meg a helyszín címét.'),
  city: z.string().min(2, 'Add meg a várost.'),
  shiftDates: z
    .string()
    .min(3, 'Add meg a tervezett időpontot/időpontokat (pl. 2025.03.15. 9:00-13:00).'),
  expectedHours: z
    .string()
    .transform((value) => (value ? Number(value) : undefined))
    .pipe(z.number().optional()),
  capacity: z
    .string()
    .transform((value) => (value ? Number.parseInt(value, 10) : undefined))
    .pipe(z.number().int().positive().optional()),
  additionalNotes: z.string().optional(),
});

type SubmissionFormValues = z.infer<typeof submissionSchema>;

export default function SubmitOpportunityPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      submitterName: '',
      submitterEmail: '',
      submitterRole: 'student',
      organizationName: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      opportunityTitle: '',
      opportunityDescription: '',
      locationAddress: '',
      city: '',
      shiftDates: '',
      expectedHours: undefined,
      capacity: undefined,
      additionalNotes: '',
    },
  });

  const onSubmit = useCallback(
    async (values: SubmissionFormValues) => {
      setIsSubmitting(true);

      try {
        const { error } = await supabase.from('submitted_opportunities').insert({
          submitter_name: values.submitterName,
          submitter_email: values.submitterEmail,
          submitter_role: values.submitterRole,
          organization_name: values.organizationName,
          contact_name: values.contactName,
          contact_email: values.contactEmail,
          contact_phone: values.contactPhone,
          opportunity_title: values.opportunityTitle,
          opportunity_description: values.opportunityDescription,
          location_address: values.locationAddress,
          city: values.city,
          shift_dates: values.shiftDates,
          expected_hours: values.expectedHours ?? null,
          capacity: values.capacity ?? null,
          additional_notes: values.additionalNotes ?? null,
        });

        if (error) {
          console.error('Error submitting opportunity:', error);
          toast.error('Nem sikerült beküldeni a feladatot. Próbáld újra később.');
          return;
        }

        toast.success('Köszönjük a beküldést!', {
          description:
            'Értesítést küldünk, amint a moderátoraink átnézték a feladatot. Ha pontosításra van szükség, az általad megadott elérhetőségen keresni fogunk.',
        });

        form.reset();
        router.push('/student/dashboard');
      } catch (submitError) {
        console.error('Unexpected error submitting opportunity:', submitError);
        toast.error('Váratlan hiba történt. Próbáld újra később.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, router, supabase],
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Feladat beküldése</CardTitle>
            <CardDescription>
              Küldd be az általad ismert közösségi szolgálati lehetőséget. Csapatunk manuálisan
              ellenőrzi és jóváhagyja, mielőtt felkerül az IKSZ Finderre.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-700">Beküldő adatai</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="submitterName">Neved *</Label>
                    <Input
                      id="submitterName"
                      placeholder="Kiss Anna"
                      {...form.register('submitterName')}
                    />
                    {form.formState.errors.submitterName && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.submitterName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="submitterEmail">Email címed *</Label>
                    <Input
                      id="submitterEmail"
                      type="email"
                      placeholder="annakiss@example.com"
                      {...form.register('submitterEmail')}
                    />
                    {form.formState.errors.submitterEmail && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.submitterEmail.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="submitterRole">Szerepköröd *</Label>
                  <Select
                    defaultValue={form.getValues('submitterRole')}
                    onValueChange={(value: 'student' | 'teacher') =>
                      form.setValue('submitterRole', value)
                    }
                  >
                    <SelectTrigger id="submitterRole">
                      <SelectValue placeholder="Válassz szerepkört" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Diák</SelectItem>
                      <SelectItem value="teacher">Tanár / koordinátor</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.submitterRole && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.submitterRole.message}
                    </p>
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-700">Fogadó szervezet adatai</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="organizationName">Szervezet neve *</Label>
                    <Input
                      id="organizationName"
                      placeholder="Zöld Budapest Egyesület"
                      {...form.register('organizationName')}
                    />
                    {form.formState.errors.organizationName && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.organizationName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Kapcsolattartó neve *</Label>
                    <Input
                      id="contactName"
                      placeholder="Nagy Péter"
                      {...form.register('contactName')}
                    />
                    {form.formState.errors.contactName && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.contactName.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Kapcsolattartó email címe *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="info@szervezet.hu"
                      {...form.register('contactEmail')}
                    />
                    {form.formState.errors.contactEmail && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.contactEmail.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Kapcsolattartó telefonszáma *</Label>
                    <Input
                      id="contactPhone"
                      placeholder="+36 30 123 4567"
                      {...form.register('contactPhone')}
                    />
                    {form.formState.errors.contactPhone && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.contactPhone.message}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-700">Lehetőség részletei</h2>
                <div className="space-y-2">
                  <Label htmlFor="opportunityTitle">Feladat címe *</Label>
                  <Input
                    id="opportunityTitle"
                    placeholder="Környezetvédelmi akció a Városligetben"
                    {...form.register('opportunityTitle')}
                  />
                  {form.formState.errors.opportunityTitle && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.opportunityTitle.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="opportunityDescription">Rövid leírás *</Label>
                  <Textarea
                    id="opportunityDescription"
                    placeholder="Írd le, mivel jár a feladat, milyen eszközök, tudás szükséges, kik a célcsoport..."
                    rows={5}
                    {...form.register('opportunityDescription')}
                  />
                  {form.formState.errors.opportunityDescription && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.opportunityDescription.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="locationAddress">Helyszín címe *</Label>
                    <Input
                      id="locationAddress"
                      placeholder="Városliget, Budapest"
                      {...form.register('locationAddress')}
                    />
                    {form.formState.errors.locationAddress && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.locationAddress.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Város *</Label>
                    <Input id="city" placeholder="Budapest" {...form.register('city')} />
                    {form.formState.errors.city && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.city.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="shiftDates">Tervezett időpont(ok) *</Label>
                    <Input
                      id="shiftDates"
                      placeholder="2025.03.15. 9:00-13:00 (vagy részletesebb leírás)"
                      {...form.register('shiftDates')}
                    />
                    {form.formState.errors.shiftDates && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.shiftDates.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expectedHours">
                      Várható IKSZ óraszám (opcionális)
                    </Label>
                    <Input
                      id="expectedHours"
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="4"
                      {...form.register('expectedHours')}
                    />
                    {form.formState.errors.expectedHours && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.expectedHours.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Férőhelyek száma (opcionális)</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      placeholder="10"
                      {...form.register('capacity')}
                    />
                    {form.formState.errors.capacity && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.capacity.message}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-700">További információ</h2>
                <div className="space-y-2">
                  <Label htmlFor="additionalNotes">
                    Megjegyzések a moderátoroknak (opcionális)
                  </Label>
                  <Textarea
                    id="additionalNotes"
                    placeholder="Ide írhatsz minden további kérést vagy megjegyzést."
                    rows={4}
                    {...form.register('additionalNotes')}
                  />
                </div>
              </section>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  A beküldött adatokat manuálisan ellenőrizzük. Csak jóváhagyott feladatok kerülnek
                  fel a diákok számára.
                </p>
                <Button type="submit" disabled={isSubmitting} className="sm:w-auto">
                  {isSubmitting ? 'Beküldés folyamatban…' : 'Feladat beküldése'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
