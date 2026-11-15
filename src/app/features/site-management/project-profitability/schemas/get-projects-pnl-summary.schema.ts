import { uuidField } from '@shared/schemas';
import * as z from 'zod';

/** P&L summary of several projects at once (project list column). */
export const ProjectsPnlSummaryGetRequestSchema = z
  .object({
    siteId: z.array(uuidField).min(1).max(100),
  })
  .strict();

const ProjectPnlSummarySchema = z.looseObject({
  siteId: uuidField,
  /** Taxable value of approved sales invoices. */
  revenue: z.number(),
  totalProjectCost: z.number(),
  netProfit: z.number(),
  profitMarginPercentage: z.number(),
  salesInvoiceCount: z.number(),
});

export const ProjectsPnlSummaryGetResponseSchema = z.looseObject({
  items: z.array(ProjectPnlSummarySchema),
});
