'use client';

import { forwardRef, useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z, type ZodRawShape } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Globe,
  Star,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Opportunity } from '@/lib/opportunity-service';
import type { OpportunityReview, ReviewRatingValue, ReviewCategory } from '@/lib/review-types';
import { REVIEW_CATEGORIES } from '@/lib/review-types';
import {
  REVIEW_MAX_COMMENT_LENGTH,
  REVIEW_MIN_WORD_COUNT,
  hasMinimumWordCount,
} from '@/lib/review-validation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

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
  reviews: OpportunityReview[];
}

type ReviewFormRatings = Record<ReviewCategory, number>;

const buildDefaultRatings = (): ReviewFormRatings =>
  REVIEW_CATEGORIES.reduce((accumulator, category) => {
    accumulator[category.key as ReviewCategory] = 0;
    return accumulator;
  }, {} as ReviewFormRatings);

const reviewRatingSchema = z.object(
  REVIEW_CATEGORIES.reduce((shape, category) => {
    shape[category.key] = z
      .number({
        invalid_type_error: 'Adj meg 1 és 5 közötti értékelést.',
      })
      .int('Csak egész számú értékelés adható meg.')
      .min(1, 'Kérlek értékeld ezt a kategóriát 1 és 5 csillag között.')
      .max(5, 'Csak 1 és 5 csillag közötti érték adható meg.');
    return shape;
  }, {} as ZodRawShape),
);

const reviewFormSchema = z.object({
  reviewerDisplayName: z
    .string()
    .trim()
    .max(120, 'A név legfeljebb 120 karakter lehet.')
    .optional(),
  comment: z
    .string({
      required_error: 'Az értékelés szövege kötelező.',
      invalid_type_error: 'Az értékelés szövegének karakterláncnak kell lennie.',
    })
    .max(
      REVIEW_MAX_COMMENT_LENGTH,
      `Az értékelés maximum ${REVIEW_MAX_COMMENT_LENGTH} karakter lehet.`,
    )
    .refine((value) => value.trim().length > 0, {
      message: 'Az értékelés szövege nem lehet üres.',
    })
    .refine(hasMinimumWordCount, {
      message: `Az értékeléshez legalább ${REVIEW_MIN_WORD_COUNT} szó szükséges.`,
    }),
  ratings: reviewRatingSchema,
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  onBlur: () => void;
  name: string;
  disabled: boolean;
  label: string;
}

const StarRatingInput = forwardRef<HTMLInputElement, StarRatingInputProps>(
  ({ value, onChange, onBlur, name, disabled, label }, ref) => (
    <div className="flex items-center gap-1">
      <input
        type="hidden"
        name={name}
        value={value ?? 0}
        onBlur={onBlur}
        ref={ref}
      />
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        const isActive = value >= starValue;
        return (
          <button
            type="button"
            key={starValue}
            onClick={() => onChange(starValue)}
            onBlur={onBlur}
            disabled={disabled}
            className={cn(
              'rounded-sm p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
              disabled ? 'cursor-not-allowed opacity-70' : 'hover:text-yellow-400',
              isActive ? 'text-yellow-500' : 'text-gray-300',
            )}
            aria-pressed={isActive}
            aria-label={`${starValue} csillag a(z) ${label} kategóriára`}
          >
            <Star
              className="h-5 w-5"
              fill={isActive ? 'currentColor' : 'none'}
            />
          </button>
        );
      })}
    </div>
  ),
);
StarRatingInput.displayName = 'StarRatingInput';

const renderStars = (value: number) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, index) => {
      const isActive = index < value;
      return (
        <Star
          key={index}
          className={cn(
            'h-4 w-4 transition-colors',
            isActive ? 'text-yellow-500' : 'text-gray-300',
          )}
          fill={isActive ? 'currentColor' : 'none'}
        />
      );
    })}
  </div>
);

export default function OpportunityDetailClient({ opportunity, reviews }: OpportunityDetailClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [localReviews, setLocalReviews] = useState<OpportunityReview[]>(reviews);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      reviewerDisplayName: '',
      comment: '',
      ratings: buildDefaultRatings(),
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

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

  const handleReviewSubmit = useCallback(
    async (values: ReviewFormValues) => {
      if (!user) {
        toast.error('A visszajelzés beküldéséhez be kell jelentkezned!', {
          action: {
            label: 'Bejelentkezés',
            onClick: () => router.push('/student'),
          },
        });
        return;
      }

      const payloadRatings: ReviewRatingValue[] = REVIEW_CATEGORIES.map((category) => ({
        key: category.key,
        label: category.label,
        value: values.ratings[category.key as ReviewCategory],
      }));

      const reviewerDisplayName = values.reviewerDisplayName?.trim();
      const body = {
        reviewerDisplayName: reviewerDisplayName ? reviewerDisplayName : undefined,
        comment: values.comment.trim(),
        ratings: payloadRatings,
      };

      try {
        const response = await fetch(`/api/opportunities/${opportunity.id}/reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          let message = 'Nem sikerült beküldeni az értékelést.';
          try {
            const errorBody = await response.json();
            if (errorBody?.details && Array.isArray(errorBody.details) && errorBody.details.length > 0) {
              message = errorBody.details[0];
            } else if (typeof errorBody?.error === 'string') {
              message = errorBody.error;
            }
          } catch {
            // ignore JSON parse issues
          }
          toast.error(message);
          return;
        }

        const data = (await response.json()) as { review?: OpportunityReview | null };
        if (!data?.review) {
          toast.error('Nem sikerült elmenteni az értékelést. Próbáld meg újra később.');
          return;
        }

        setLocalReviews((previous) => [data.review as OpportunityReview, ...previous]);
        toast.success('Köszönjük az értékelést! 🎉');
        reset({
          reviewerDisplayName: '',
          comment: '',
          ratings: buildDefaultRatings(),
        });
        router.refresh();
      } catch (error) {
        console.error('Nem sikerült beküldeni az értékelést:', error);
        toast.error('Nem sikerült beküldeni az értékelést. Próbáld meg később.');
      }
    },
    [opportunity.id, reset, router, user],
  );

  const badgeClass =
    categoryColors[opportunity.category] ?? 'bg-gray-100 text-gray-800';
  const deadlineLabel = formatDeadline(opportunity.deadline);
  const description =
    opportunity.longDescription ??
    opportunity.description ??
    'A szervező később ad meg részleteket.';
  const hasReviews = localReviews.length > 0;

  const categorySummaries = useMemo(() => {
    if (!hasReviews) {
      return [];
    }

    const totals = new Map<
      string,
      {
        label: string;
        sum: number;
        count: number;
      }
    >();

    localReviews.forEach((review) => {
      review.ratings.forEach((rating) => {
        const next = totals.get(rating.key);
        if (next) {
          next.sum += rating.value;
          next.count += 1;
          if (!next.label && rating.label) {
            next.label = rating.label;
          }
        } else {
          totals.set(rating.key, {
            label: rating.label,
            sum: rating.value,
            count: 1,
          });
        }
      });
    });

    const categoryOrder = REVIEW_CATEGORIES.map((category) => category.key);

    const orderedKeys = [
      ...categoryOrder.filter((key) => totals.has(key)),
      ...Array.from(totals.keys()).filter((key) => !categoryOrder.includes(key)),
    ];

    return orderedKeys.map((key) => {
      const entry = totals.get(key);
      if (!entry) {
        return null;
      }

      const average = entry.sum / entry.count;
      return {
        key,
        label: entry.label,
        average: Math.round(average * 10) / 10,
        count: entry.count,
      };
    }).filter((value): value is NonNullable<typeof value> => Boolean(value));
  }, [hasReviews, localReviews]);

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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Diák értékelések</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Olvasd el mások tapasztalatait, mielőtt jelentkezel.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {!hasReviews ? (
                  <p className="text-sm text-muted-foreground">
                    Még nem érkezett visszajelzés ehhez a lehetőséghez. Légy te az első, aki értékel!
                  </p>
                ) : (
                  <>
                    {categorySummaries.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Átlagos értékelések
                        </h4>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          {categorySummaries.map((category) => (
                            <div
                              key={category.key}
                              className="rounded-lg border bg-white p-3 shadow-sm"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">
                                  {category.label}
                                </span>
                                <span className="text-sm font-semibold text-gray-700">
                                  {category.average.toFixed(1)}
                                </span>
                              </div>
                              <div className="mt-2 flex items-center justify-between">
                                {renderStars(Math.round(category.average))}
                                <span className="text-xs text-muted-foreground">
                                  {category.count} értékelés
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Visszajelzések
                      </h4>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Összesen {localReviews.length} értékelés</span>
                        <span>Legfrissebb felül</span>
                      </div>
                      <div className="max-h-96 space-y-4 overflow-y-auto pr-1">
                        {localReviews.map((review) => {
                          const reviewerName = review.reviewerDisplayName ?? 'Anonim diák';
                          const createdAtLabel = formatDate(review.createdAt);

                          return (
                            <div
                              key={review.id}
                              className="rounded-xl border bg-white p-4 shadow-sm"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-gray-900">{reviewerName}</p>
                                <span className="text-xs text-muted-foreground">{createdAtLabel}</span>
                              </div>
                              <div className="mt-3 space-y-2">
                                {review.ratings.map((rating) => (
                                  <div
                                    key={rating.key}
                                    className="flex items-center justify-between gap-3"
                                  >
                                    <span className="text-sm text-gray-700">{rating.label}</span>
                                    {renderStars(rating.value)}
                                  </div>
                                ))}
                              </div>
                              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-800">
                                  {review.comment}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Oszd meg a tapasztalataidat</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Minden visszajelzés segít a többi diáknak jó döntést hozni.
                </p>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={handleSubmit(handleReviewSubmit)} className="space-y-6">
                    <FormField
                      control={control}
                      name="reviewerDisplayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Megjelenített név</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ''}
                              placeholder="Pl. Kiss Anna"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormDescription>
                            Ha üresen hagyod, az értékelés anonimként jelenik meg.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Értékelés kategóriánként</p>
                        <p className="text-xs text-muted-foreground">
                          Adj 1-5 csillagot az alábbi szempontokra.
                        </p>
                      </div>
                      <div className="space-y-4">
                        {REVIEW_CATEGORIES.map((category) => (
                          <FormField
                            key={category.key}
                            control={control}
                            name={`ratings.${category.key}` as const}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  {category.label}
                                </FormLabel>
                                <FormControl>
                                  <StarRatingInput
                                    name={field.name}
                                    value={field.value ?? 0}
                                    onChange={(next) => field.onChange(next)}
                                    onBlur={field.onBlur}
                                    disabled={isSubmitting}
                                    label={category.label}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    <FormField
                      control={control}
                      name="comment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Írd le a tapasztalataidat *</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value ?? ''}
                              rows={5}
                              placeholder="Írd le pár mondatban, hogyan élted meg a lehetőséget és kinek ajánlanád."
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormDescription>
                            Legalább {REVIEW_MIN_WORD_COUNT} szó, maximum {REVIEW_MAX_COMMENT_LENGTH} karakter.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? 'Küldés...' : 'Értékelés elküldése'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
