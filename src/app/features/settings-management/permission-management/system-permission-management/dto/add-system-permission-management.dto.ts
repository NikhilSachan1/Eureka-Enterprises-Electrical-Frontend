import { z } from 'zod';
import { CommonSystemPermissionFields } from '@features/settings-management/permission-management/system-permission-management/dto/common-system-permission-management.dto';
import { toLowerCase } from '@shared/utility';
import { SystemPermissionListBaseResponseSchema } from '@features/settings-management/permission-management/system-permission-management/dto/system-permission-management-list.dto';

export const AddSystemPermissionRequestSchema = z
  .object({
    name: CommonSystemPermissionFields.name.transform(val => toLowerCase(val)),
    module: CommonSystemPermissionFields.module.transform(val =>
      toLowerCase(val)
    ),
    label: CommonSystemPermissionFields.label.transform(val =>
      toLowerCase(val)
    ),
    description: CommonSystemPermissionFields.description.transform(val =>
      toLowerCase(val)
    ),
  })
  .strict();

export const AddSystemPermissionResponseSchema =
  SystemPermissionListBaseResponseSchema;
