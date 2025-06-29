import { z } from 'zod';
import { CommonSystemPermissionFields } from './common-system-permission-management.dto';
import { toLowerCase } from '../../../../../shared/utility';
import { SystemPermissionListBaseResponseSchema } from './system-permission-management-list.dto';

export const EditSystemPermissionRequestSchema = z.object({
    description: CommonSystemPermissionFields.description.transform((val) => toLowerCase(val)),
}).strict();

export const EditSystemPermissionResponseSchema = z.object({
    message: z
        .string({required_error: 'Message is required'})
        .nonempty()
}).strict();