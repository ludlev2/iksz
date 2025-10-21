import { z } from 'zod';

export const reviewRatingValueSchema = z.object({
  key: z.string().trim().min(1, 'A kategória azonosítója kötelező.'),
  label: z.string().trim().min(1, 'A kategória neve kötelező.'),
  value: z
    .number({
      invalid_type_error: 'Az értékelésnek számnak kell lennie.',
    })
    .int('Csak egész számú értékelés adható meg.')
    .min(1, 'Az értékelés minimum 1.')
    .max(5, 'Az értékelés maximum 5.'),
});

export const reviewRatingsSchema = z
  .array(reviewRatingValueSchema, {
    invalid_type_error: 'Legalább egy értékelési kategóriát meg kell adni.',
  })
  .nonempty('Legalább egy értékelési kategória szükséges.')
  .superRefine((ratings, ctx) => {
    const keys = new Set<string>();
    ratings.forEach((rating, index) => {
      if (keys.has(rating.key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Ugyanaz a kategória nem értékelhető többször.',
          path: [index, 'key'],
        });
      } else {
        keys.add(rating.key);
      }
    });
  });

export const REVIEW_MIN_WORD_COUNT = 5;
export const REVIEW_MAX_COMMENT_LENGTH = 1500;

export const hasMinimumWordCount = (value: string) => {
  const words = value
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return words.length >= REVIEW_MIN_WORD_COUNT;
};

export const createReviewPayloadSchema = z.object({
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
  reviewerDisplayName: z
    .string()
    .trim()
    .min(1, 'A név legalább 1 karakter hosszú legyen.')
    .max(120, 'A név legfeljebb 120 karakter lehet.')
    .optional(),
  ratings: reviewRatingsSchema,
});

export type CreateReviewPayload = z.infer<typeof createReviewPayloadSchema>;
