import { z } from 'zod';
import { dateField, fileField } from '@shared/schemas';

/** Empty controls often send `null`; Zod `.optional()` only allows `undefined`. */
const optionalTrimmed = z
  .union([z.string(), z.null()])
  .optional()
  .transform(v => v ?? undefined);

const gstReleaseAttachmentsField = z.preprocess(
  (v: unknown) => v ?? [],
  z.array(fileField)
);

const gstReleaseDateField = z.preprocess(
  (v: unknown) => (v === null ? undefined : v),
  dateField
);

/** Plain amount only — no extra GST calculation on this field. */
export const GstPaymentReleaseDocAddRequestSchema = z
  .object({
    docContext: z.enum(['sales', 'purchase']),
    gstReleaseAmount: z.preprocess(
      (v: unknown) => v ?? undefined,
      z.number().positive()
    ),
    gstReleaseDate: gstReleaseDateField,
    gstReleaseRemark: optionalTrimmed,
    gstReleaseAttachments: gstReleaseAttachmentsField,
    /** Contractor / vendor id from GST party-wise bucket (IndexedDB party column). */
    gstReleasePartyKey: optionalTrimmed,
    /** Purchase (GST screen): `YYYY-MM` for bucket matching. */
    gstReleaseMonthKey: optionalTrimmed,
    /** Purchase: UTR for govt GST payment (bank transfer row). */
    gstReleaseUtr: optionalTrimmed,
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.docContext !== 'purchase') {
      return;
    }
    if (!data.gstReleaseUtr?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'UTR / reference number is required.',
        path: ['gstReleaseUtr'],
      });
    }
  });

/** Edit existing GST release — does not re-run vendor payment + advice bundle. */
export const GstPaymentReleaseDocUpdateRequestSchema = z
  .object({
    docContext: z.enum(['sales', 'purchase']),
    gstReleaseAmount: z.preprocess(
      (v: unknown) => v ?? undefined,
      z.number().positive()
    ),
    gstReleaseDate: gstReleaseDateField,
    gstReleaseRemark: optionalTrimmed,
    gstReleaseAttachments: gstReleaseAttachmentsField,
    gstReleasePartyKey: optionalTrimmed,
    gstReleaseMonthKey: optionalTrimmed,
    gstReleaseUtr: optionalTrimmed,
  })
  .strict();

export const GstPaymentReleaseDocAddResponseSchema = z.looseObject({
  message: z.string(),
});
