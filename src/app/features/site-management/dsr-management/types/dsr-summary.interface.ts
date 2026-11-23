import type { IDocWorkspaceContextView } from '@features/site-management/doc-management/shared/types/doc-workspace-context.interface';
import type {
  EDsrTimelineEntryKind,
  TDsrTimelineEntry,
} from './dsr-summary.types';

/** Row of the "Project wise" DSR tab (one project, summed on the server). */
export interface IDsrProjectSummaryRow {
  id: string;
  siteId: string;
  docWorkspaceContext: IDocWorkspaceContextView;
  /** Project status as the project list shows it. */
  statusLabel: string;
  expectedDays: number;
  reportedDays: number;
  missingDays: number;
  reportCount: number;
  reporters: number;
  /** Reported share of expected days (0–100); null when nobody was allocated. */
  reportedPercent: number | null;
  lastReportDate: Date | null;
  /** Whole days since the last report; null when there is none. */
  daysSinceLastReport: number | null;
  /** Last report is old while days are still missing. */
  isStale: boolean;
}

/** Drawer data: the project whose DSR timeline is shown, and the workspace period. */
export interface IDsrProjectTimelineData {
  siteId: string;
  projectName: string;
  projectLocation: string;
  periodFrom: Date | null;
  periodTo: Date | null;
  /** Count only this person's allocations (roles limited to their own DSRs). */
  userId: string | null;
}

/** One DSR shown on the timeline. */
export interface IDsrTimelineReport {
  id: string;
  reporterName: string;
  employeeId: string;
  workTypes: string[];
  reportingEngineerName: string;
  remarks: string | null;
}

export interface IDsrTimelineReported {
  kind: EDsrTimelineEntryKind.REPORTED;
  day: Date;
  reports: IDsrTimelineReport[];
}

/** Consecutive days someone was allocated but no DSR came in. */
export interface IDsrTimelineMissing {
  kind: EDsrTimelineEntryKind.MISSING;
  start: Date;
  end: Date;
  days: number;
  /** People allocated on those days. */
  allocatedPeople: string[];
}

/** Timeline entries of one month, newest month first. */
export interface IDsrTimelineMonth {
  month: Date;
  entries: TDsrTimelineEntry[];
}

export interface IDsrProjectTimeline {
  months: IDsrTimelineMonth[];
  expectedDays: number;
  reportedDays: number;
  missingDays: number;
  reporters: number;
}
