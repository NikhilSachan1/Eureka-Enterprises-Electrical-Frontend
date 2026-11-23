import * as z from 'zod';
import { dateField, FilterSchema, uuidField } from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';

const { pageSize, page, sortField, sortOrder } = FilterSchema.shape;

/** Filters for the per-project DSR summary (paged on the server). */
export const DsrProjectSummaryGetRequestSchema = z
  .object({
    projectName: uuidField.optional(),
    /** Workspace date filter: days in this range. */
    dateRange: z.array(dateField).nullable().optional(),
    search: z.string().optional(),
    // Sent by the table; the summary keeps its own order.
    sortField,
    sortOrder,
    pageSize,
    page,
  })
  .strict()
  .transform(data => {
    const [start, end] = data.dateRange ?? [];
    const term = data.search?.trim();
    return {
      page: data.page,
      pageSize: data.pageSize,
      siteId: data.projectName,
      periodFrom: start ? transformDateFormat(start) : undefined,
      periodTo: end ? transformDateFormat(end) : undefined,
      search: term !== undefined && term !== '' ? term : undefined,
    };
  });

export const DsrProjectSummarySchema = z.looseObject({
  siteId: uuidField,
  name: z.string(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  status: z.string().nullable().optional(),
  /** Days someone was allocated to the project. */
  expectedDays: z.number().int(),
  /** Of those, days with at least one DSR. */
  reportedDays: z.number().int(),
  missingDays: z.number().int(),
  reportCount: z.number().int(),
  reporters: z.number().int(),
  lastReportDate: z.string().nullable(),
});

export const DsrProjectSummaryGetResponseSchema = z.looseObject({
  records: z.array(DsrProjectSummarySchema),
  totalRecords: z.number().int().nonnegative(),
});
