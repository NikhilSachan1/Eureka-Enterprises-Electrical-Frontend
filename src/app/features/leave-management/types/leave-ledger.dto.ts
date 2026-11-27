import * as z from 'zod';
import {
  LeaveLedgerEntrySchema,
  LeaveLedgerGetRequestSchema,
  LeaveLedgerGetResponseSchema,
  LeaveLedgerMonthSchema,
} from '../schemas/leave-ledger.schema';

export type ILeaveLedgerGetFormDto = z.input<
  typeof LeaveLedgerGetRequestSchema
>;
export type ILeaveLedgerGetResponseDto = z.infer<
  typeof LeaveLedgerGetResponseSchema
>;
export type ILeaveLedgerEntryDto = z.infer<typeof LeaveLedgerEntrySchema>;
export type ILeaveLedgerMonthDto = z.infer<typeof LeaveLedgerMonthSchema>;
