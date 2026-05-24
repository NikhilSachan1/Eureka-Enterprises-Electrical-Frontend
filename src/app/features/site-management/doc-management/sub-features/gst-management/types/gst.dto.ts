import { z } from 'zod';
import {
  AddGstPaymentReleaseRequestSchema,
  AddGstPaymentReleaseResponseSchema,
  GstEntryDetailGetResponseSchema,
  GstEntryGetBaseResponseSchema,
  GstEntryGetRequestSchema,
  GstEntryGetResponseSchema,
  RevertGstEntryRequestSchema,
  RevertGstEntryResponseSchema,
  VerifyGstEntryRequestSchema,
  VerifyGstEntryResponseSchema,
} from '../schemas';

/**
 * GST Entry Get Base Response
 */
export type IGstEntryGetBaseResponseDto = z.infer<
  typeof GstEntryGetBaseResponseSchema
>;
export type IGstEntryGetResponseDto = z.infer<typeof GstEntryGetResponseSchema>;
export type IGstEntryGetFormDto = z.input<typeof GstEntryGetRequestSchema>;

/**
 * GST Entry Detail Get Response
 */
export type IGstEntryDetailGetResponseDto = z.infer<
  typeof GstEntryDetailGetResponseSchema
>;

/**
 * Verify GST Entry
 */
export type IVerifyGstEntryFormDto = z.input<
  typeof VerifyGstEntryRequestSchema
>;
export type IVerifyGstEntryUIFormDto = Omit<
  IVerifyGstEntryFormDto,
  'fileKey' | 'fileName'
> & {
  verificationAttachment: File[];
};

export type IVerifyGstEntryResponseDto = z.infer<
  typeof VerifyGstEntryResponseSchema
>;

/**
 * Revert GST Entry
 */
export type IRevertGstEntryFormDto = z.input<
  typeof RevertGstEntryRequestSchema
>;
export type IRevertGstEntryResponseDto = z.infer<
  typeof RevertGstEntryResponseSchema
>;

/**
 * Add GST Payment Release
 */
export type IAddGstPaymentReleaseFormDto = z.input<
  typeof AddGstPaymentReleaseRequestSchema
>;
export type IAddGstPaymentReleaseUIFormDto = Omit<
  IAddGstPaymentReleaseFormDto,
  'fileKey' | 'fileName'
> & {
  paymentAttachment: File[];
};
export type IAddGstPaymentReleaseResponseDto = z.infer<
  typeof AddGstPaymentReleaseResponseSchema
>;
