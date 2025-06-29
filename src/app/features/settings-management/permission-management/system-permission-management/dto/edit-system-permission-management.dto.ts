import { z } from 'zod';
import { CommonSystemPermissionFields } from './common-system-permission-management.dto';
import { toLowerCase } from '../../../../../shared/utility';
import { SystemPermissionListBaseResponseSchema } from './system-permission-management-list.dto';

export const EditSystemPermissionRequestSchema = z.object({
    description: CommonSystemPermissionFields.description.transform((val) => toLowerCase(val)),
});

export const EditSystemPermissionResponseSchema = SystemPermissionListBaseResponseSchema;