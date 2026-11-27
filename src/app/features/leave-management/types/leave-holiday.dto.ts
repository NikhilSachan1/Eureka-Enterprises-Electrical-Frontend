import * as z from 'zod';
import {
  LeaveHolidaysGetRequestSchema,
  LeaveHolidaysGetResponseSchema,
} from '../schemas/leave-holiday.schema';

export type ILeaveHolidaysGetFormDto = z.input<
  typeof LeaveHolidaysGetRequestSchema
>;
export type ILeaveHolidaysGetResponseDto = z.infer<
  typeof LeaveHolidaysGetResponseSchema
>;

/** One holiday as the leave date picker uses it. */
export interface ILeaveHoliday {
  /** YYYY-MM-DD */
  isoDate: string;
  /** Local midnight of the day, for the date picker. */
  date: Date;
  name: string;
  /** e.g. "8 Nov 2026" */
  label: string;
}
