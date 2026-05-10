import {
  AttachmentsGetRequestSchema,
  AttachmentsGetResponseSchema,
  FinancialFileUploadResponseSchema,
} from '@shared/schemas/';
import z from 'zod';

export type IAttachmentsGetRequestDto = z.infer<
  typeof AttachmentsGetRequestSchema
>;

export type IAttachmentsGetResponseDto = z.infer<
  typeof AttachmentsGetResponseSchema
>;

export type IFinancialFileUploadResponseDto = z.infer<
  typeof FinancialFileUploadResponseSchema
>;
