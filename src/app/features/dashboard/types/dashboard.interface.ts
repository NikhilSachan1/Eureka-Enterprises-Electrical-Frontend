import { EDataType, StatusSeverity } from '@shared/types';
import { EKpmDashboardSeverity } from './dashboard.enum';

/** Per-employee remaining leave balance (unit from API, default days). */
export interface IDashboardEmployeeLeaveBalanceRow {
  readonly employeeName: string;
  readonly employeeCode?: string;
  /** Lowercase name + code, built once so search does not recase every keystroke. */
  readonly searchText: string;
  readonly balance: number;
  /** e.g. `days`, `hours` — optional; UI defaults to “days”. */
  readonly unit?: string;
}

export interface IDashboardAttendanceTrailStop {
  readonly kind: 'project' | 'vehicle' | 'person';
  readonly label: string;
  readonly value: string;
  readonly icon: string;
}

export interface IDashboardTodayAttendanceRow {
  readonly id: string;
  readonly employeeName: string;
  readonly employeeCode: string;
  readonly assignmentTrail: readonly IDashboardAttendanceTrailStop[];
  /** Lowercase name, code, assignment, and status — built once for search. */
  readonly searchText: string;
  readonly attendanceStatus: string;
  readonly statusKey: string;
  readonly statusTone: StatusSeverity;
}

export type TDashboardOpsAttentionKind =
  | 'calibration'
  | 'warranty'
  | 'fleet'
  | 'service';

export type TDashboardOpsAttentionDomain = 'asset' | 'vehicle' | 'service';

export type TDashboardOpsAttentionFilter = 'all' | TDashboardOpsAttentionDomain;

export type TDashboardOpsAttentionLane = 'overdue' | 'soon';

export interface IDashboardOpsAttentionTag {
  readonly kind: TDashboardOpsAttentionKind;
  readonly label: string;
}

/** One entity in the ops attention board — multiple alert types as labels. */
export interface IDashboardOpsAttentionRow {
  readonly id: string;
  readonly domain: TDashboardOpsAttentionDomain;
  readonly lane: TDashboardOpsAttentionLane;
  readonly title: string;
  readonly meta: string;
  readonly tags: readonly IDashboardOpsAttentionTag[];
}

export interface IDashboardOpsAttentionChip {
  readonly id: TDashboardOpsAttentionFilter;
  readonly label: string;
  readonly count: number;
}

/** Navigation target for a clickable KPM metric row. */
export interface IDashboardKpmMetricLink {
  readonly commands: readonly string[];
  readonly queryParams?: Record<string, string | readonly string[]>;
}

/** Row for a KPM dashboard metric. */
export interface IDashboardKpmMetricRow {
  readonly icon: string;
  readonly label: string;
  readonly hint?: string;
  readonly value: number;
  readonly format: EDataType;
  readonly state: EKpmDashboardSeverity;
  /** When true, the value column shows a spinner (e.g. while its backing API is in flight). */
  readonly valueLoading?: boolean;
  readonly link?: IDashboardKpmMetricLink;
}

/** Row for a Birthday, Anniversary or Holiday in the dashboard. */
export interface IDashboardCelebrationRow {
  readonly label: string;
  readonly value: string;
  readonly imageUrl?: string;
  readonly daysLeft: number;
  readonly completedYears?: number | null;
}

/** Expense metrics for the ledger balance. */
export interface IDashboardExpenseMetricsLedger {
  balances: {
    openingBalance: number;
    closingBalance: number;
    eurekaOpeningBalance: number;
    eurekaClosingBalance: number;
    payableTotalAmount: number;
    overpaidTotalAmount: number;
  };
  employees: {
    name: string;
    netAmount: number;
  }[];
}
