import z from 'zod';
import { DsrBaseSchema } from './base-dsr.schema';
import { DsrGetBaseResponseSchema } from './get-dsr.schema';

const { id } = DsrBaseSchema.shape;

export const DsrDetailGetRequestSchema = z
  .object({
    dsrId: id,
  })
  .strict()
  .transform(data => {
    return {
      id: data.dsrId,
    };
  });

export const DsrDetailGetResponseSchema = DsrGetBaseResponseSchema.omit({
  createdByUser: true,
});
