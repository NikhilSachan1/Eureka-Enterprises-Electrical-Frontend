import { z } from "zod";

export const CommonRoleFields = {
    name: z
        .string({ required_error: 'Role Name is required' })
        .trim()
        .min(1, 'Role Name cannot be empty'),
    description: z
        .string({ required_error: 'Description is required' })
        .trim()
        .min(1, 'Description cannot be empty'),
    label: z
        .string({ required_error: 'Label is required' })
        .trim()
        .min(1, 'Label cannot be empty'),
};