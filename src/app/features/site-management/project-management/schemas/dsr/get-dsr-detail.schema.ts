import { z } from 'zod';
import { uuidField } from '@shared/schemas';
import { DsrGetBaseResponseSchema } from './get-dsr.schema';

export const DsrDetailGetRequestSchema = z
  .object({
    dsrId: uuidField,
  })
  .strict()
  .transform(data => {
    return {
      id: data.dsrId,
    };
  });

export const DsrDetailGetResponseSchema = DsrGetBaseResponseSchema;
