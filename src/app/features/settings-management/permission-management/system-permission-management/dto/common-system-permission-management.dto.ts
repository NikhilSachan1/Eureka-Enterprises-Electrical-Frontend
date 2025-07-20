import { z } from 'zod';

export const CommonSystemPermissionFields = {
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
  isEditable: z.boolean({ required_error: 'Is Editable is required' }),
  isDeletable: z.boolean({ required_error: 'Is Deletable is required' }),
};
