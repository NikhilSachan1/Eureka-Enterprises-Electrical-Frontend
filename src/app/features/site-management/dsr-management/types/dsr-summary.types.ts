import type {
  IDsrTimelineMissing,
  IDsrTimelineReported,
} from './dsr-summary.interface';

/** One line of a project's DSR timeline: a day with reports, or a run of days with none. */
export enum EDsrTimelineEntryKind {
  REPORTED = 'reported',
  MISSING = 'missing',
}

export type TDsrTimelineEntry = IDsrTimelineReported | IDsrTimelineMissing;
