import { toLowerCase } from '@shared/utility';
import { SystemPermissionGetBaseResponseSchema } from './get-system-permission.schema';
import { SystemPermissionBaseSchema } from './base-system-permission.schema';

const { name, module, label, description } = SystemPermissionBaseSchema.shape;

export const SystemPermissionAddRequestSchema = SystemPermissionBaseSchema.pick(
  {
    name: true,
    module: true,
    label: true,
    description: true,
  }
)
  .extend({
    name: name.transform(val => toLowerCase(val)),
    module: module.transform(val => toLowerCase(val)),
    label: label.transform(val => toLowerCase(val)),
    description: description.transform(val => toLowerCase(val)),
  })
  .strict();

export const SystemPermissionAddResponseSchema =
  SystemPermissionGetBaseResponseSchema;
