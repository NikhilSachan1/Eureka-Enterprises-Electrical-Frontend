import { replaceTextWithSeparator, toLowerCase } from '@shared/utility';
import { RoleGetBaseResponseSchema } from './get-role.schema';
import { RoleBaseSchema } from './base-role.schema';

const { name, description, label } = RoleBaseSchema.shape;

export const RoleAddRequestSchema = RoleBaseSchema.pick({
  name: true,
  description: true,
  label: true,
})
  .extend({
    name: name.transform(val =>
      replaceTextWithSeparator(toLowerCase(val), ' ', '_')
    ),
    description: description.transform(val => toLowerCase(val)),
    label: label.transform(val => toLowerCase(val)),
  })
  .strict();

export const RoleAddResponseSchema = RoleGetBaseResponseSchema;
