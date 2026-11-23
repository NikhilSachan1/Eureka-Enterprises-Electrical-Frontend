import type {
  EJourneyEntryKind,
  TJourneyEntry,
} from './allocation-journey.types';

/**
 * Data for the allocation drawers: one employee's journey across projects (with the free days
 * between allocations) and the people of one project. Dates are calendar days; a period's end
 * day is included and a running allocation counts up to today.
 */

export interface IJourneyAllocation {
  kind: EJourneyEntryKind.ALLOCATION;
  id: string;
  projectName: string;
  projectLocation: string;
  role: string;
  start: Date;
  /** Null while the allocation is still running. */
  end: Date | null;
  days: number;
}

export interface IJourneyFreeGap {
  kind: EJourneyEntryKind.FREE;
  start: Date;
  end: Date;
  days: number;
}

/** Entries of one calendar year, newest year first. */
export interface IJourneyYear<T> {
  year: number;
  entries: T[];
}

export interface IEmployeeJourney {
  years: IJourneyYear<TJourneyEntry>[];
  allocationCount: number;
  projectCount: number;
  allocatedDays: number;
  freeDays: number;
  currentProjects: string[];
}

export interface IProjectRosterEntry {
  id: string;
  fullName: string;
  employeeId: string;
  role: string;
  start: Date;
  /** Null while the allocation is still running. */
  end: Date | null;
  days: number;
  /** Who allocated the person; null when not recorded. */
  allocatedBy: string | null;
  /** Who removed the person from the project; null while on it or when not recorded. */
  removedBy: string | null;
}

export interface IProjectRoster {
  /** People on the project now. */
  current: IProjectRosterEntry[];
  /** Every allocation on the project (allocated and deallocated), by start year, newest first. */
  years: IJourneyYear<IProjectRosterEntry>[];
  totalPeople: number;
  allocationCount: number;
}

/** Drawer data: the employee whose journey is shown. */
export interface IEmployeeAllocationJourneyData {
  userId: string;
  fullName: string;
  employeeId: string;
  /** Free-day window from the table row (YYYY-MM-DD), so both count the same days. */
  freeFrom: string | null;
  freeTo: string | null;
}

/** Days free days are counted over: joining (or first allocation) to exit or today. */
export interface IJourneyFreeWindow {
  from: string | null;
  to: string | null;
}

/** Drawer data: the project whose people are shown. */
export interface IProjectAllocationRosterData {
  siteId: string;
  projectName: string;
  projectLocation: string;
}
