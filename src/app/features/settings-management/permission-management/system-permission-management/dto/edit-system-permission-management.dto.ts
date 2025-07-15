import { z } from 'zod';
import { CommonSystemPermissionFields } from '@features/settings-management/permission-management/system-permission-management/dto/common-system-permission-management.dto';
import { toLowerCase } from '@shared/utility';

export const EditSystemPermissionRequestSchema = z.object({
    description: CommonSystemPermissionFields.description.transform((val) => toLowerCase(val)),
}).strict();

export const EditSystemPermissionResponseSchema = z.object({
    message: z
        .string({required_error: 'Message is required'})
        .nonempty()
}).strict();