import { z } from 'zod';
import {
  AttendanceActionRequestSchema,
  AttendanceActionResponseSchema,
  AttendanceApplyRequestSchema,
  AttendanceApplyResponseSchema,
  AttendanceCurrentStatusGetResponseSchema,
  AttendanceForceRequestSchema,
  AttendanceForceResponseSchema,
  AttendanceGetRequestSchema,
  AttendanceGetResponseSchema,
  AttendanceHistoryGetRequestSchema,
  AttendanceHistoryGetResponseSchema,
  AttendanceRegularizedRequestSchema,
  AttendanceRegularizedResponseSchema,
  AttendanceGetBaseResponseSchema,
  AttendanceGetStatsResponseSchema,
  AttendanceCurrentStatusGetFormSchema,
} from '../schemas';

/**
 * Attendance Get
 */
export type IAttendanceGetBaseResponseDto = z.infer<
  typeof AttendanceGetBaseResponseSchema
>;
export type IAttendanceGetResponseDto = z.infer<
  typeof AttendanceGetResponseSchema
>;
export type IAttendanceGetStatsResponseDto = z.infer<
  typeof AttendanceGetStatsResponseSchema
>;
export type IAttendanceGetRequestDto = z.infer<
  typeof AttendanceGetRequestSchema
>;
export type IAttendanceGetFormDto = z.input<typeof AttendanceGetRequestSchema>;

/**
 * Attendance History Get
 */
export type IAttendanceHistoryGetResponseDto = z.infer<
  typeof AttendanceHistoryGetResponseSchema
>;

export type IAttendanceHistoryGetRequestDto = z.infer<
  typeof AttendanceHistoryGetRequestSchema
>;
export type IAttendanceHistoryGetFormDto = z.input<
  typeof AttendanceHistoryGetRequestSchema
>;

/**
 * Attendance Current Status Get
 */

export type IAttendanceCurrentStatusGetResponseDto = z.infer<
  typeof AttendanceCurrentStatusGetResponseSchema
>;
export type IAttendanceCurrentStatusGetRequestDto = z.infer<
  typeof AttendanceCurrentStatusGetFormSchema
>;
export type IAttendanceCurrentStatusGetFormDto = z.input<
  typeof AttendanceCurrentStatusGetFormSchema
>;
/**
 * Attendance Apply
 */

export type IAttendanceApplyRequestDto = z.infer<
  typeof AttendanceApplyRequestSchema
>;
export type IAttendanceApplyResponseDto = z.infer<
  typeof AttendanceApplyResponseSchema
>;
export type IAttendanceApplyFormDto = z.input<
  typeof AttendanceApplyRequestSchema
>;
export type IAttendanceApplyUIFormDto = Pick<
  IAttendanceApplyFormDto,
  'remark'
> & {
  company: NonNullable<IAttendanceApplyFormDto['company']>['id'] | null;
  contractors: NonNullable<
    IAttendanceApplyFormDto['contractors'][number]
  >['id'][];
  vehicle: NonNullable<IAttendanceApplyFormDto['vehicle']>['id'] | null;
  assignedEngineer:
    | NonNullable<IAttendanceApplyFormDto['assignedEngineer']>['id']
    | null;
};

/*
  Attendance Regularized
*/

export type IAttendanceRegularizedRequestDto = z.infer<
  typeof AttendanceRegularizedRequestSchema
>;

export type IAttendanceRegularizedFormDto = z.input<
  typeof AttendanceRegularizedRequestSchema
>;
export type IAttendanceRegularizedUIFormDto = Pick<
  IAttendanceRegularizedFormDto,
  'attendanceStatus'
>;
export type IAttendanceRegularizedResponseDto = z.infer<
  typeof AttendanceRegularizedResponseSchema
>;

/**
 * Attendance Force
 */
export type IAttendanceForceRequestDto = z.infer<
  typeof AttendanceForceRequestSchema
>;
export type IAttendanceForceFormDto = z.input<
  typeof AttendanceForceRequestSchema
>;
export type IAttendanceForceResponseDto = z.infer<
  typeof AttendanceForceResponseSchema
>;
export type IAttendanceForceUIFormDto = Pick<
  IAttendanceForceFormDto,
  'employeeName' | 'attendanceDate' | 'attendanceStatus' | 'remark'
> & {
  company: NonNullable<IAttendanceForceFormDto['company']>['id'] | null;
  contractors: NonNullable<
    IAttendanceForceFormDto['contractors'][number]
  >['id'][];
  vehicle: NonNullable<IAttendanceForceFormDto['vehicle']>['id'] | null;
  assignedEngineer:
    | NonNullable<IAttendanceForceFormDto['assignedEngineer']>['id']
    | null;
};

/**
 * Attendance Action
 */
export type IAttendanceActionRequestDto = z.infer<
  typeof AttendanceActionRequestSchema
>;
export type IAttendanceActionFormDto = z.input<
  typeof AttendanceActionRequestSchema
>;
export type IAttendanceActionUIFormDto = Pick<
  IAttendanceActionFormDto,
  'remark'
>;
export type IAttendanceActionResponseDto = z.infer<
  typeof AttendanceActionResponseSchema
>;
