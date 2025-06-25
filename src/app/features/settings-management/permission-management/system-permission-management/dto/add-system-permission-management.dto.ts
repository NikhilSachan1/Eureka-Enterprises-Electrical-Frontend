import { z } from 'zod';
import { CommonSystemPermissionFields } from './common-system-permission-management.dto';
import { toLowerCase } from '../../../../../shared/utility';
import { SystemPermissionListBaseResponseSchema } from './system-permission-management-list.dto';

export const AddSystemPermissionRequestSchema = z.object({
    name: CommonSystemPermissionFields.name.transform((val) => toLowerCase(val)),
    module: CommonSystemPermissionFields.module.transform((val) => toLowerCase(val)),
    label: CommonSystemPermissionFields.label.transform((val) => toLowerCase(val)),
    description: CommonSystemPermissionFields.description.transform((val) => toLowerCase(val)),
});

export const AddSystemPermissionResponseSchema = SystemPermissionListBaseResponseSchema