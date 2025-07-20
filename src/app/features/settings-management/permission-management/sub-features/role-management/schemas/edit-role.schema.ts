import { z } from 'zod';
import { toLowerCase } from '@shared/utility';
import { RoleBaseSchema } from './base-role.schema';

const { description, label } = RoleBaseSchema.shape;

export const RoleEditRequestSchema = RoleBaseSchema.pick({
  description: true,
  label: true,
})
  .extend({
    description: description.transform(val => toLowerCase(val)),
    label: label.transform(val => toLowerCase(val)),
  })
  .strict();

export const RoleEditResponseSchema = z
  .object({
    message: z.string().nonempty({ message: 'Message is required' }),
  })
  .strict();
