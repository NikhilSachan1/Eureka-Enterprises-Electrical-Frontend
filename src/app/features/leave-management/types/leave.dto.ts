import { z } from 'zod';
import {
  LeaveGetBaseResponseSchema,
  LeaveActionRequestSchema,
  LeaveActionResponseSchema,
  LeaveApplyRequestSchema,
  LeaveApplyResponseSchema,
  LeaveForceRequestSchema,
  LeaveForceResponseSchema,
  LeaveGetResponseSchema,
  LeaveGetStatsResponseSchema,
  LeaveGetRequestSchema,
  LeaveBalanceGetResponseSchema,
  LeaveBalanceGetRequestSchema,
  LeaveBalanceGetBaseResponseSchema,
} from '../schemas';

/**
 * Get Leave
 */

export type ILeaveGetRequestDto = z.infer<typeof LeaveGetRequestSchema>;
export type ILeaveGetFormDto = z.input<typeof LeaveGetRequestSchema>;
export type ILeaveGetBaseResponseDto = z.infer<
  typeof LeaveGetBaseResponseSchema
>;
export type ILeaveGetStatsResponseDto = z.infer<
  typeof LeaveGetStatsResponseSchema
>;
export type ILeaveGetResponseDto = z.infer<typeof LeaveGetResponseSchema>;

/**
 * Apply Leave
 */
export type ILeaveApplyRequestDto = z.infer<typeof LeaveApplyRequestSchema>;
export type ILeaveApplyFormDto = z.input<typeof LeaveApplyRequestSchema>;
export type ILeaveApplyResponseDto = z.infer<typeof LeaveApplyResponseSchema>;

/**
 * Force Leave
 */
export type ILeaveForceRequestDto = z.infer<typeof LeaveForceRequestSchema>;
export type ILeaveForceFormDto = z.input<typeof LeaveForceRequestSchema>;
export type ILeaveForceResponseDto = z.infer<typeof LeaveForceResponseSchema>;

/**
 * Action Leave
 */
export type ILeaveActionRequestDto = z.infer<typeof LeaveActionRequestSchema>;
export type ILeaveActionFormDto = z.input<typeof LeaveActionRequestSchema>;
export type ILeaveActionUIFormDto = Omit<
  ILeaveActionFormDto,
  'approvalStatus' | 'leaveIds'
>;
export type ILeaveActionResponseDto = z.infer<typeof LeaveActionResponseSchema>;

/**
 * Get Leave Balance
 */
export type ILeaveBalanceGetRequestDto = z.infer<
  typeof LeaveBalanceGetRequestSchema
>;
export type ILeaveBalanceGetFormDto = z.input<
  typeof LeaveBalanceGetRequestSchema
>;
export type ILeaveBalanceGetBaseResponseDto = z.infer<
  typeof LeaveBalanceGetBaseResponseSchema
>;
export type ILeaveBalanceGetResponseDto = z.infer<
  typeof LeaveBalanceGetResponseSchema
>;
