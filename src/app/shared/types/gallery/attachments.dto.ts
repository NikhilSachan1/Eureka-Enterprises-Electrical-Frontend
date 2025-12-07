import {
  AttachmentsGetRequestSchema,
  AttachmentsGetResponseSchema,
} from '@shared/schemas/';
import z from 'zod';

export type IAttachmentsGetRequestDto = z.infer<
  typeof AttachmentsGetRequestSchema
>;

export type IAttachmentsGetResponseDto = z.infer<
  typeof AttachmentsGetResponseSchema
>;
