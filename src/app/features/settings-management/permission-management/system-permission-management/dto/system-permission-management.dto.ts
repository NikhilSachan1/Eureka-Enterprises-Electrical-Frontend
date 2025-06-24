import { z } from 'zod';
import { toTitleCase } from '../../../../../shared/utility/string.util';

export const AddSystemPermissionRequestSchema = z.object({
    name: z
        .string({ required_error: 'Name is required' })
        .trim()
        .min(1, 'Name cannot be empty'),
    module: z
        .string({ required_error: 'Module is required' })
        .trim()
        .min(1, 'Module cannot be empty'),
    label: z
        .string({ required_error: 'Label is required' })
        .trim()
        .min(1, 'Label cannot be empty')
        .transform((val) => toTitleCase(val)),
    description: z
        .string({ required_error: 'Comment is required' })
        .trim()
        .min(1, 'Comment cannot be empty')
}).strict();

export const AddSystemPermissionResponseSchema = z.object({
    id: z
        .string({ required_error: 'ID is required' })
        .trim()
        .uuid()
        .min(1, 'ID cannot be empty'),
    name: z
        .string({ required_error: 'Name is required' })
        .trim()
        .min(1, 'Name cannot be empty'),
    module: z
        .string({ required_error: 'Module is required' })
        .trim()
        .min(1, 'Module cannot be empty'),
    label: z
        .string({ required_error: 'Label is required' })
        .trim()
        .min(1, 'Label cannot be empty'),
    description: z
        .string({ required_error: 'Description is required' })
        .trim()
        .min(1, 'Description cannot be empty'),
    createdBy: z
        .string({ required_error: 'Created by is required' })
        .trim()
        .min(1, 'Created by cannot be empty')
        .nullable(),
    updatedBy: z
        .string({ required_error: 'Updated by is required' })
        .trim()
        .min(1, 'Updated by cannot be empty')
        .nullable(),
    deletedBy: z
        .string({ required_error: 'Deleted by is required' })
        .trim()
        .min(1, 'Deleted by cannot be empty')
        .nullable(),
    createdAt: z
        .string({ required_error: 'Created at is required' })
        .trim()
        .min(1, 'Created at cannot be empty')
        .datetime({ message: 'Created at must be a valid ISO date string' }),
    updatedAt: z
        .string({ required_error: 'Updated at is required' })
        .trim()
        .min(1, 'Updated at cannot be empty')
        .datetime({ message: 'Updated at must be a valid ISO date string' })
        .nullable(),
    deletedAt: z
        .string({ required_error: 'Deleted at is required' })
        .trim()
        .min(1, 'Deleted at cannot be empty')
        .datetime({ message: 'Deleted at must be a valid ISO date string' })
        .nullable(),
}).strict();