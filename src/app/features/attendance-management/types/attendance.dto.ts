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
