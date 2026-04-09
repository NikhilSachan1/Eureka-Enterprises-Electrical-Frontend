import { z } from 'zod';
import { EmployeeBaseSchema } from './base-employee.schema';

const { id } = EmployeeBaseSchema.shape;

export const EmployeeSendPasswordLinkRequestSchema = z
  .object({
    employeeIds: z.array(id).min(1),
  })
  .strict()
  .transform(data => ({
    userIds: data.employeeIds,
  }));

export const EmployeeSendPasswordLinkResponseSchema = z
  .looseObject({
    message: z.string().min(1),
    results: z.array(
      z.looseObject({
        userId: id,
        status: z.string(),
        error: z.string().optional(),
      })
    ),
  })
  .transform(({ message, results }) => {
    const st = (s: string | undefined): string =>
      (s ?? '').trim().toLowerCase();

    const result = results
      .filter(row => st(row.status) === 'success')
      .map(row => ({
        userId: row.userId,
        message: row.error?.trim() ?? 'Password link sent',
      }));

    const errors = results
      .filter(row => st(row.status) === 'error')
      .map(row => ({
        userId: row.userId,
        error: row.error?.trim() ?? 'Failed to send password link',
      }));

    return { message, result, errors };
  });
