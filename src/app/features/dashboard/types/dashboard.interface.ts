import { EDataType } from '@shared/types';
import { EKpmDashboardSeverity } from './dashboard.enum';

export interface IDashboardEmployeeMetrics {
  total: number;
  active: number;
  inactive: number;
  newJoinersLast30Days: number;
  byGender: {
    male: number;
    female: number;
    other: number;
  };
}

/** Upcoming birthday in the dashboard window (ISO date = next occurrence). */
export interface IDashboardBirthdayRow {
  readonly employeeName: string;
  readonly employeeCode?: string;
  readonly date: string;
}

/** Work anniversary in the dashboard window. */
export interface IDashboardWorkAnniversaryRow {
  readonly employeeName: string;
  readonly employeeCode?: string;
  readonly date: string;
  readonly years: number;
}

/** Public / company holiday in the dashboard window (ISO date). */
export interface IDashboardHolidayRow {
  readonly name: string;
  readonly date: string;
}

export interface IDashboardCelebrations {
  readonly birthdays: readonly IDashboardBirthdayRow[];
  readonly workAnniversaries: readonly IDashboardWorkAnniversaryRow[];
  readonly holidays: readonly IDashboardHolidayRow[];
}

/** Per-employee remaining leave balance (unit from API, default days). */
export interface IDashboardEmployeeLeaveBalanceRow {
  readonly employeeName: string;
  readonly employeeCode?: string;
  readonly balance: number;
  /** e.g. `days`, `hours` — optional; UI defaults to “days”. */
  readonly unit?: string;
}

/** Leave requests in approval workflow (counts by status). */
export interface IDashboardLeaveMetrics {
  approval: {
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
    total: number;
  };
  /** Remaining leave by employee — from API. */
  readonly employeeWiseLeaveBalance: readonly IDashboardEmployeeLeaveBalanceRow[];
}

export interface IDashboardAttendanceMetrics {
  attendance: {
    total: number;
    present: number;
    absent: number;
    leave: number;
    checkedIn: number;
    notCheckedInYet: number;
    holiday: number;
  };
  approval: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
}

/** Per-employee net from ledger view: + = pay to employee, − = recover from employee. */
export interface IDashboardEmployeeLedgerRow {
  readonly employeeName: string;
  readonly employeeCode?: string;
  readonly netAmount: number;
}

export interface IDashboardExpenseMetrics {
  balances: {
    openingBalance: number;
    closingBalance: number;
    totalCredit: number;
    totalDebit: number;
    eurekaOpeningBalance: number;
    eurekaClosingBalance: number;
  };
  approval: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  /** Employee-wise settlement (expense ledger); can be empty when no data. */
  readonly employeeWiseNet: readonly IDashboardEmployeeLedgerRow[];
  /**
   * Total amount to pay employees (देना है) for this ledger — from API only; do not derive from rows in UI.
   */
  employeePayableTotal: number;
}

export interface IDashboardFuelMetrics {
  balances: {
    openingBalance: number;
    closingBalance: number;
    totalCredit: number;
    totalDebit: number;
    eurekaOpeningBalance: number;
    eurekaClosingBalance: number;
  };
  approval: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  /** Employee-wise settlement (fuel ledger); separate from expense. */
  readonly employeeWiseNet: readonly IDashboardEmployeeLedgerRow[];
  /**
   * Total amount to pay employees (देना है) for fuel ledger — from API only; do not derive from rows in UI.
   */
  employeePayableTotal: number;
}

/** Row for an asset approaching expiry (calibration / warranty). */
export interface IDashboardAssetExpiryRow {
  readonly name: string;
  readonly assetId: string;
}

/** Row for a vehicle in an expiring-soon bucket (compliance / warranty). */
export interface IDashboardVehicleExpiryRow {
  readonly vehicleName: string;
  readonly vehicleNumber: string;
}

/** Row for a scheduled service line (grouped by urgency). */
export interface IDashboardVehicleServiceRow {
  readonly vehicleName: string;
  readonly vehicleNumber: string;
}

/** Assets: availability + calibration + warranty health. */
export interface IDashboardAssetMetrics {
  total: number;
  /** Unassigned / available count */
  free: number;
  calibrationExpiringSoon: number;
  calibrationExpired: number;
  warrantyExpiringSoon: number;
  warrantyExpired: number;
  readonly calibrationExpiringSoonItems: readonly IDashboardAssetExpiryRow[];
  readonly calibrationExpiredItems: readonly IDashboardAssetExpiryRow[];
  readonly warrantyExpiringSoonItems: readonly IDashboardAssetExpiryRow[];
  readonly warrantyExpiredItems: readonly IDashboardAssetExpiryRow[];
}

/** Fleet: availability + compliance (fitness / registration window) + warranty. */
export interface IDashboardVehicleFleetMetrics {
  total: number;
  free: number;
  complianceExpiringSoon: number;
  complianceExpired: number;
  warrantyExpiringSoon: number;
  warrantyExpired: number;
  readonly complianceExpiringSoonItems: readonly IDashboardVehicleExpiryRow[];
  readonly complianceExpiredItems: readonly IDashboardVehicleExpiryRow[];
  readonly warrantyExpiringSoonItems: readonly IDashboardVehicleExpiryRow[];
  readonly warrantyExpiredItems: readonly IDashboardVehicleExpiryRow[];
}

/** Next service windows across the fleet. */
export interface IDashboardVehicleServiceMetrics {
  upcoming: number;
  dueSoon: number;
  overdue: number;
  readonly upcomingItems: readonly IDashboardVehicleServiceRow[];
  readonly dueSoonItems: readonly IDashboardVehicleServiceRow[];
  readonly overdueItems: readonly IDashboardVehicleServiceRow[];
}

/** Vehicle with no reading received for at least 2 full days (API rule). */
export interface IDashboardVehicleReadingGapRow {
  readonly vehicleName: string;
  readonly vehicleNumber: string;
  /** YYYY-MM-DD of last received reading, if known */
  readonly lastReceivedDate?: string;
}

/** One vehicle flagged by reading / odometer checks — include human-readable reason from API. */
export interface IDashboardVehicleReadingAnomalyRow {
  readonly vehicleName: string;
  readonly vehicleNumber: string;
  readonly reason: string;
}

/**
 * Minimal fleet reading alerts: anomaly flag + vehicles silent for 2+ days.
 */
export interface IDashboardVehicleReadingMetrics {
  /** Any anomaly detected (odometer sanity, duplicate, etc.) */
  readonly anomalyDetected: boolean;
  /** Optional summary when API does not send per-vehicle rows */
  readonly anomalyDetail?: string;
  /** Vehicles with anomalies — each row includes reason */
  readonly anomalyVehicles: readonly IDashboardVehicleReadingAnomalyRow[];
  readonly vehiclesNoReadingTwoPlusDays: readonly IDashboardVehicleReadingGapRow[];
}

/** Financial snapshot for one active project (amounts in ₹). */
export interface IDashboardActiveProjectRow {
  readonly name: string;
  readonly code?: string;
  /** Short label for chart category axis */
  readonly shortLabel: string;
  readonly contractValue: number;
  readonly expenseToDate: number;
  /** Positive = ahead / profit vs internal baseline; negative = loss or overspend signal */
  readonly netPosition: number;
  readonly progressPercent: number;
}

/** Project pipeline + active portfolio financials (API-shaped; mock on dashboard until wired). */
export interface IDashboardProjectMetrics {
  readonly total: number;
  readonly active: number;
  readonly upcoming: number;
  readonly completed: number;
  readonly onHold: number;
  readonly activeContractTotal: number;
  readonly activeExpenseTotal: number;
  readonly activeNetTotal: number;
  readonly activeProjects: readonly IDashboardActiveProjectRow[];
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
}

/** Row for a Birthday, Anniversary or Holiday in the dashboard. */
export interface IDashboardCelebrationRow {
  readonly label: string;
  readonly value: string;
  readonly imageUrl?: string;
  readonly daysLeft: number;
  readonly completedYears?: number | null;
}
