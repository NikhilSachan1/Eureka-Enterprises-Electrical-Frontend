import { z } from 'zod';
import { EmployeeBaseSchema } from './base-employee.schema';

const { id, email, firstName, lastName } = EmployeeBaseSchema.shape;

export const EmployeeSendPasswordLinkRequestSchema = z
  .object({
    userIds: z.array(id).min(1),
  })
  .strict();

export const EmployeeSendPasswordLinkResponseSchema = z
  .object({
    message: z.string().min(1),
    results: z.array(
      z.object({
        userId: id,
        email,
        firstName,
        lastName,
        resetLink: z.string(),
        status: z.string(),
      })
    ),
  })
  .strict();
