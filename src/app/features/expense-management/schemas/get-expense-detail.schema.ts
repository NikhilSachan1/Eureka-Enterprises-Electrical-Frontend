import z from 'zod';
import { UserSchema, uuidField } from '@shared/schemas';
import { ExpenseGetBaseResponseSchema } from './get-expense.schema';
import { makeFieldsNullable } from '@shared/utility';

const { id } = ExpenseGetBaseResponseSchema.shape;

export const ExpenseDetailGetRequestSchema = z
  .object({
    id,
  })
  .strict();

export const ExpenseDetailGetResponseSchema = z
  .object({
    originalExpenseId: id,
    currentVersion: z.number().int().nonnegative(),
    totalVersions: z.number().int().nonnegative(),
    history: z.array(
      ExpenseGetBaseResponseSchema.extend({
        amount: z.string(),
        createdBy: uuidField,
        updatedBy: uuidField.nullable(),
        createdByUser: UserSchema,
        updatedByUser: makeFieldsNullable(UserSchema).nullable(),
      }).omit({
        approvalBy: true,
        userId: true,
      })
    ),
  })
  .strict();
