import { uuidField } from '@shared/schemas';
import z from 'zod';

export const MyFilesMoveRequestSchema = z
  .object({
    parentId: uuidField.nullable(),
  })
  .strict();

export const MyFilesMoveResponseSchema = z.looseObject({
  message: z.string(),
});
