import z from 'zod';

const DocumentGapSchema = z.looseObject({
  key: z.string(),
  label: z.string(),
  hint: z.string().optional().default(''),
  severity: z.string().optional(),
  count: z.number().nonnegative().default(0),
  oldestDays: z.number().nonnegative().default(0),
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

export const DocumentGapDetailGetResponseSchema = z.looseObject({
  key: z.string(),
  label: z.string(),
  hint: z.string().optional().default(''),
  severity: z.string().optional(),
  partyType: z.string().nullable().optional(),
  items: z.array(DocumentGapItemSchema).default([]),
  truncated: z.boolean().default(false),
});
