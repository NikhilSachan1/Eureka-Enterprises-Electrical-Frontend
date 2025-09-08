import { z } from 'zod';
import {
  LeaveActionRequestSchema,
  LeaveActionResponseSchema,
  LeaveApplyRequestSchema,
  LeaveApplyResponseSchema,
  LeaveForceRequestSchema,
  LeaveForceResponseSchema,
  LeaveGetRequestSchema,
  LeaveGetResponseSchema,
  LeaveGetBaseResponseSchema,
  LeaveGetStatsResponseSchema,
} from '../schemas';

export type ILeaveGetBaseResponseDto = z.infer<
  typeof LeaveGetBaseResponseSchema
>;

export type ILeaveGetResponseDto = z.infer<typeof LeaveGetResponseSchema>;

export type ILeaveGetStatsResponseDto = z.infer<
  typeof LeaveGetStatsResponseSchema
>;

export type ILeaveGetRequestDto = z.infer<typeof LeaveGetRequestSchema>;

export type ILeaveApplyRequestDto = z.infer<typeof LeaveApplyRequestSchema>;

export type ILeaveApplyResponseDto = z.infer<typeof LeaveApplyResponseSchema>;

export type ILeaveForceRequestDto = z.infer<typeof LeaveForceRequestSchema>;

export type ILeaveForceResponseDto = z.infer<typeof LeaveForceResponseSchema>;

export type ILeaveActionRequestDto = z.infer<typeof LeaveActionRequestSchema>;
export type ILeaveActionResponseDto = z.infer<typeof LeaveActionResponseSchema>;
