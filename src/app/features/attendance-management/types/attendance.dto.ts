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

export type IAttendanceHistoryGetResponseDto = z.infer<
  typeof AttendanceHistoryGetResponseSchema
>;

export type IAttendanceHistoryGetRequestDto = z.infer<
  typeof AttendanceHistoryGetRequestSchema
>;

export type IAttendanceCurrentStatusGetResponseDto = z.infer<
  typeof AttendanceCurrentStatusGetResponseSchema
>;

export type IAttendanceApplyRequestDto = z.infer<
  typeof AttendanceApplyRequestSchema
>;

export type IAttendanceApplyResponseDto = z.infer<
  typeof AttendanceApplyResponseSchema
>;

export type IAttendanceRegularizedRequestDto = z.infer<
  typeof AttendanceRegularizedRequestSchema
>;

export type IAttendanceRegularizedResponseDto = z.infer<
  typeof AttendanceRegularizedResponseSchema
>;

export type IAttendanceForceRequestDto = z.infer<
  typeof AttendanceForceRequestSchema
>;

export type IAttendanceForceResponseDto = z.infer<
  typeof AttendanceForceResponseSchema
>;

export type IAttendanceActionRequestDto = z.infer<
  typeof AttendanceActionRequestSchema
>;
export type IAttendanceActionResponseDto = z.infer<
  typeof AttendanceActionResponseSchema
>;
