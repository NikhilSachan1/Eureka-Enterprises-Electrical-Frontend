import z from 'zod';
import { DsrBaseSchema } from './base-dsr.schema';
import { DsrGetBaseResponseSchemaInner } from './get-dsr.schema';

const { id } = DsrBaseSchema.shape;

export const DsrHistoryGetRequestSchema = z
  .object({
    dsrId: id,
  })
  .strict()
  .transform(data => {
    return {
      id: data.dsrId,
    };
  });

export const DsrHistoryGetResponseSchema = DsrGetBaseResponseSchemaInner.omit({
  createdByUser: true,
}).transform(({ files, ...rest }) => ({
  ...rest,
  documentKeys: files?.map(file => file.fileKey) ?? [],
}));
