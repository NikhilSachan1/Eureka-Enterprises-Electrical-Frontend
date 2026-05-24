import { z } from 'zod';
import {
  AddTdsPaymentReleaseRequestSchema,
  AddTdsPaymentReleaseResponseSchema,
  TdsEntryDetailGetResponseSchema,
  TdsEntryGetBaseResponseSchema,
  TdsEntryGetRequestSchema,
  TdsEntryGetResponseSchema,
  RevertTdsEntryResponseSchema,
  VerifyTdsEntryResponseSchema,
} from '../schemas';

/**
 * TDS Entry Get Base Response
 */
export type ITdsEntryGetBaseResponseDto = z.infer<
  typeof TdsEntryGetBaseResponseSchema
>;
export type ITdsEntryGetResponseDto = z.infer<typeof TdsEntryGetResponseSchema>;
export type ITdsEntryGetFormDto = z.input<typeof TdsEntryGetRequestSchema>;

/**
 * TDS Entry Detail Get Response
 */
export type ITdsEntryDetailGetResponseDto = z.infer<
  typeof TdsEntryDetailGetResponseSchema
>;

/**
 * Verify TDS Entry Response
 */
export type IVerifyTdsEntryResponseDto = z.infer<
  typeof VerifyTdsEntryResponseSchema
>;

/**
 * Revert TDS Entry Response
 */
export type IRevertTdsEntryResponseDto = z.infer<
  typeof RevertTdsEntryResponseSchema
>;

/**
 * Add TDS Payment Release
 */
export type IAddTdsPaymentReleaseFormDto = z.input<
  typeof AddTdsPaymentReleaseRequestSchema
>;
export type IAddTdsPaymentReleaseUIFormDto = Omit<
  IAddTdsPaymentReleaseFormDto,
  'fileKey' | 'fileName'
> & {
  paymentAttachment: File[];
};
export type IAddTdsPaymentReleaseResponseDto = z.infer<
  typeof AddTdsPaymentReleaseResponseSchema
>;
