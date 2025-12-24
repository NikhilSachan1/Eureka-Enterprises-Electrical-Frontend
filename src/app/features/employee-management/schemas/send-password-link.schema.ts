import { z } from 'zod';
import { EmployeeBaseSchema } from './base-employee.schema';

const { id } = EmployeeBaseSchema.shape;

export const EmployeeSendPasswordLinkRequestSchema = z
  .object({
    userIds: z.array(id).min(1),
  })
  .strict();

export const EmployeeSendPasswordLinkResultSchema = z
  .object({
    userId: id,
    message: z.string(),
  })
  .strict();

export const EmployeeSendPasswordLinkErrorSchema = z
  .object({
    userId: id,
    error: z.string().min(1),
  })
  .strict();

export const EmployeeSendPasswordLinkResponseSchema = z
  .object({
    message: z.string().min(1),
    result: z.array(EmployeeSendPasswordLinkResultSchema),
    errors: z.array(EmployeeSendPasswordLinkErrorSchema),
  })
  .strict();
