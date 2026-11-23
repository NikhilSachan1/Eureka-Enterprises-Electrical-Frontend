import {
  IJourneyAllocation,
  IJourneyFreeGap,
} from './allocation-journey.interface';

/** What one line of an employee's journey is: time on a project, or free days between. */
export enum EJourneyEntryKind {
  ALLOCATION = 'allocation',
  FREE = 'free',
}

export type TJourneyEntry = IJourneyAllocation | IJourneyFreeGap;
