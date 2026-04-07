import z from 'zod';
import { UserSchema, uuidField } from '@shared/schemas';
import { makeFieldsNullable } from '@shared/utility';
import { ExpenseBaseSchema } from './base-expense.schema';
import { ExpenseGetBaseResponseSchema } from './get-expense.schema';

const { id } = ExpenseBaseSchema.shape;
const { approvalByUser, updatedAt, createdAt } =
  ExpenseGetBaseResponseSchema.shape;

export const ExpenseDetailGetRequestSchema = z
  .object({
    expenseId: id,
  })
  .strict()
  .transform(data => {
    return {
      id: data.expenseId,
    };
  });

export const ExpenseDetailGetResponseSchema = z.looseObject({
  originalExpenseId: id,
  currentVersion: z.number().int().nonnegative(),
  totalVersions: z.number().int().nonnegative(),
  history: z.array(
    ExpenseBaseSchema.extend({
      amount: z.string(),
      createdBy: uuidField,
      updatedBy: uuidField.nullable(),
      user: UserSchema,
      createdByUser: UserSchema,
      updatedByUser: makeFieldsNullable(UserSchema).nullable(),
      approvalByUser,
      updatedAt,
      createdAt,
    }).omit({
      approvalBy: true,
      userId: true,
    })
  ),
});
