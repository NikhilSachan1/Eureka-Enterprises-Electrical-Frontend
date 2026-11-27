import * as z from 'zod';
import {
  LeaveLedgerEntrySchema,
  LeaveLedgerGetRequestSchema,
  LeaveLedgerGetResponseSchema,
  LeaveLedgerMonthSchema,
  LeaveRecalculationApplyRequestSchema,
  LeaveRecalculationGetRequestSchema,
  LeaveRecalculationResponseSchema,
  LeaveRecalculationRowSchema,
} from '../schemas/leave-ledger.schema';

export type ILeaveLedgerGetFormDto = z.input<
  typeof LeaveLedgerGetRequestSchema
>;
export type ILeaveLedgerGetResponseDto = z.infer<
  typeof LeaveLedgerGetResponseSchema
>;
export type ILeaveLedgerEntryDto = z.infer<typeof LeaveLedgerEntrySchema>;
export type ILeaveLedgerMonthDto = z.infer<typeof LeaveLedgerMonthSchema>;

export type ILeaveRecalculationGetFormDto = z.input<
  typeof LeaveRecalculationGetRequestSchema
>;
export type ILeaveRecalculationResponseDto = z.infer<
  typeof LeaveRecalculationResponseSchema
>;
export type ILeaveRecalculationRowDto = z.infer<
  typeof LeaveRecalculationRowSchema
>;
export type ILeaveRecalculationApplyFormDto = z.input<
  typeof LeaveRecalculationApplyRequestSchema
>;
