import type { IDocWorkspaceContextView } from '@features/site-management/doc-management/shared/types/doc-workspace-context.interface';
import { ISiteAllocationGetBaseResponseDto } from './project.dto';

export interface ISiteAllocationHistory {
  id: string;
  docWorkspaceContext: IDocWorkspaceContextView;
  user: {
    fullName: string;
    employeeId: string;
  };
  role: string;
  allocationPeriod: Date[];
  lastUpdatedAt: Date;
  /** Null when no one is recorded, so the table shows an empty cell instead of an avatar. */
  lastUpdatedBy: {
    fullName: string;
    employeeId: string;
  } | null;
  allocationStatus: string;
  originalRawData: ISiteAllocationGetBaseResponseDto;
}

/** Row of the "Employee wise" allocation tab (one employee, summed on the server). */
export interface IEmployeeAllocationSummaryRow {
  id: string;
  userId: string;
  user: {
    fullName: string;
    employeeId: string;
  };
  /** Employee status as the employee list shows it (Active / Archived). */
  statusLabel: string;
  projectCount: number;
  allocatedDays: number;
  /** Days with no allocation in the working window; null when it cannot be counted. */
  freeDays: number | null;
  /** On-site share of on-site + free days (0–100) for the bar; null when there is nothing to show. */
  onSitePercent: number | null;
  /** Window the free days cover (YYYY-MM-DD), passed on to the journey drawer. */
  freeFrom: string | null;
  freeTo: string | null;
}

/** Row of the "Project wise" allocation tab (one project, summed on the server). */
export interface IProjectAllocationSummaryRow {
  id: string;
  siteId: string;
  docWorkspaceContext: IDocWorkspaceContextView;
  /** Project status as the project list shows it (Ongoing, Completed, …). */
  statusLabel: string;
  currentPeople: number;
  totalPeople: number;
  allocationCount: number;
}
