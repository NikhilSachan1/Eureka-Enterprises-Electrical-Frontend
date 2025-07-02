import { z } from 'zod';
import { toLowerCase } from '../../../../../shared/utility';
import { CommonRoleFields } from './common-role-permission-management.dto';

export const EditRoleManagementRequestSchema = z.object({
    description: CommonRoleFields.description.transform((val) => toLowerCase(val)),
    label: CommonRoleFields.label.transform((val) => toLowerCase(val)),
}).strict();

export const EditRoleManagementResponseSchema = z.object({
    message: z
        .string()
        .nonempty({message: 'Message is required'})
}).strict();