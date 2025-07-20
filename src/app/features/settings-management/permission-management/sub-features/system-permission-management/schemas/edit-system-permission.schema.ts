import { z } from 'zod';
import { toLowerCase } from '@shared/utility';
import { SystemPermissionBaseSchema } from './base-system-permission.schema';

const { description } = SystemPermissionBaseSchema.shape;

export const SystemPermissionEditRequestSchema =
  SystemPermissionBaseSchema.pick({
    description: true,
  })
    .extend({
      description: description.transform(val => toLowerCase(val)),
    })
    .strict();

export const SystemPermissionEditResponseSchema = z
  .object({
    message: z.string({ required_error: 'Message is required' }).nonempty(),
  })
  .strict();
