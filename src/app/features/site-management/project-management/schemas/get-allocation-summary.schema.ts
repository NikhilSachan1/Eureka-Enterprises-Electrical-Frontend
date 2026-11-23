import * as z from 'zod';
import { dateField, FilterSchema, uuidField } from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';

const { pageSize, page, sortField, sortOrder } = FilterSchema.shape;

/** Filters for the per-employee and per-project allocation summaries (paged on the server). */
export const AllocationSummaryGetRequestSchema = z
  .object({
    projectName: uuidField.optional(),
    /** Employee summary only: just this employee. */
    employeeName: uuidField.optional(),
    /** Workspace date filter: allocations active on any day in this range. */
    dateRange: z.array(dateField).nullable().optional(),
    search: z.string().optional(),
    // Sent by the table; the summaries keep their own order.
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
      userId: data.employeeName,
      periodFrom: start ? transformDateFormat(start) : undefined,
      periodTo: end ? transformDateFormat(end) : undefined,
      search: term !== undefined && term !== '' ? term : undefined,
    };
  });

const SummarySiteSchema = z.looseObject({
  id: uuidField,
  name: z.string(),
  city: z.string().nullable(),
  state: z.string().nullable(),
});

const summaryDate = z.string().nullable();

export const EmployeeAllocationSummarySchema = z.looseObject({
  userId: uuidField,
  firstName: z.string(),
  lastName: z.string(),
  employeeId: z.string(),
  /** Account status; archived people are listed too, so their history stays visible. */
  status: z.string().optional(),
  allocationCount: z.number().int(),
  projectCount: z.number().int(),
  allocatedDays: z.number().int(),
  lastChange: summaryDate,
  /** Projects the employee is on today (empty = free). */
  currentSites: z.array(SummarySiteSchema),
  /** Days in the working window with no allocation; null when there is no start date. */
  freeDays: z.number().int().nullable().optional(),
  /** The window free days were counted over (YYYY-MM-DD); the journey drawer reuses it. */
  freeFrom: z.string().nullable().optional(),
  freeTo: z.string().nullable().optional(),
});

export const ProjectAllocationSummarySchema = z.looseObject({
  siteId: uuidField,
  name: z.string(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  /** Project status (upcoming, ongoing, hold, work_completed, completed). */
  status: z.string().nullable().optional(),
  allocationCount: z.number().int(),
  totalPeople: z.number().int(),
  /** People on the project today. */
  currentPeople: z.number().int(),
  firstAllocation: summaryDate,
  lastChange: summaryDate,
});

export const EmployeeAllocationSummaryGetResponseSchema = z.looseObject({
  records: z.array(EmployeeAllocationSummarySchema),
  totalRecords: z.number().int().nonnegative(),
});

export const ProjectAllocationSummaryGetResponseSchema = z.looseObject({
  records: z.array(ProjectAllocationSummarySchema),
  totalRecords: z.number().int().nonnegative(),
});
