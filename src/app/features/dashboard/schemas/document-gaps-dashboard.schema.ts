import * as z from 'zod';

const DocumentGapSideSchema = z.looseObject({
  /** The gap as this side words it; falls back to the gap's own label / hint. */
  label: z.string().optional(),
  hint: z.string().optional(),
  count: z.number().nonnegative().default(0),
  oldestDays: z.number().nonnegative().default(0),
});

const DocumentGapSchema = z.looseObject({
  key: z.string(),
  /** The document the gap belongs to: po, jmc, report, invoice, payment, advance, gst, tds. */
  group: z.string().optional(),
  label: z.string(),
  hint: z.string().optional().default(''),
  severity: z.string().optional(),
  /** Sides the gap can occur on (`CONTRACTOR` / `VENDOR`); it is shown only under those. */
  parties: z.array(z.string()).default(['CONTRACTOR', 'VENDOR']),
  count: z.number().nonnegative().default(0),
  oldestDays: z.number().nonnegative().default(0),
  byParty: z
    .looseObject({
      contractor: DocumentGapSideSchema.prefault({}),
      vendor: DocumentGapSideSchema.prefault({}),
    })
    .optional(),
});

const DocumentGapItemSchema = z.looseObject({
  id: z.string(),
  documentNumber: z.string().nullable().optional(),
  siteName: z.string().nullable().optional(),
  partyType: z.string().nullable().optional(),
  amount: z.coerce.number().nullable().optional(),
  since: z.string().nullable().optional(),
  ageDays: z.number().nonnegative().optional(),
});

export const DocumentGapsDashboardGetResponseSchema = z.looseObject({
  scope: z.string().optional(),
  totals: z
    .looseObject({
      problems: z.number().nonnegative().default(0),
      oldestDays: z.number().nonnegative().default(0),
    })
    .optional(),
  gaps: z.array(DocumentGapSchema).default([]),
  info: z.array(DocumentGapSchema).default([]),
});

export const DocumentGapDetailQuerySchema = z
  .object({
    party: z.enum(['CONTRACTOR', 'VENDOR']).optional(),
  })
  .strict();

export const DocumentGapDetailGetResponseSchema = z.looseObject({
  key: z.string(),
  label: z.string(),
  hint: z.string().optional().default(''),
  severity: z.string().optional(),
  partyType: z.string().nullable().optional(),
  /** The side the list was filtered to, when one was asked for. */
  party: z.string().nullable().optional(),
  items: z.array(DocumentGapItemSchema).default([]),
  truncated: z.boolean().default(false),
});
