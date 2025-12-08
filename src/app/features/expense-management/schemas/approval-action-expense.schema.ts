import { z } from 'zod';
import { ExpenseBaseSchema } from './base-expense.schema';

const { id, approvalStatus, approvalReason } = ExpenseBaseSchema.shape;

export const ExpenseActionBaseRequestSchema = z
  .object({
    approvalStatus,
    approvalComment: approvalReason,
    expenseId: id,
  })
  .strict();

export const ExpenseActionRequestSchema = z
  .object({
    approvals: z.array(ExpenseActionBaseRequestSchema).min(1).max(50),
  })
  .strict();

export const ExpenseActionResultSchema = z
  .object({
    approvalStatus,
    message: z.string(),
    previousStatus: approvalStatus,
    expenseId: id,
  })
  .strict();

export const ExpenseActionErrorSchema = z
  .object({
    expenseId: id,
    error: z.string().min(1),
  })
  .strict();

export const ExpenseActionResponseSchema = z
  .object({
    message: z.string().min(1),
    result: z.array(ExpenseActionResultSchema),
    errors: z.array(ExpenseActionErrorSchema),
  })
  .strict();
