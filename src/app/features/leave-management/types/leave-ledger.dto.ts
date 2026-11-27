import * as z from 'zod';
import {
  LeaveLedgerGetRequestSchema,
  LeaveLedgerGetResponseSchema,
  LeaveLedgerRecordSchema,
} from '../schemas/leave-ledger.schema';

export type ILeaveLedgerGetFormDto = z.input<
  typeof LeaveLedgerGetRequestSchema
>;
export type ILeaveLedgerGetResponseDto = z.infer<
  typeof LeaveLedgerGetResponseSchema
>;
export type ILeaveLedgerRecordDto = z.infer<typeof LeaveLedgerRecordSchema>;
