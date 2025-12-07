import { z } from 'zod';
import {
  ExpenseGetBaseResponseSchema,
  ExpenseGetRequestSchema,
  ExpenseGetStatsResponseSchema,
  ExpenseGetResponseSchema,
} from '../schemas';
import {
  ExpenseActionRequestSchema,
  ExpenseActionResponseSchema,
} from '../schemas/approval-action-expense.schema';
import {
  ExpenseDeleteRequestSchema,
  ExpenseDeleteResponseSchema,
} from '../schemas/delete-expense.schema';

export type IExpenseGetBaseResponseDto = z.infer<
  typeof ExpenseGetBaseResponseSchema
>;

export type IExpenseGetResponseDto = z.infer<typeof ExpenseGetResponseSchema>;

export type IExpenseGetStatsResponseDto = z.infer<
  typeof ExpenseGetStatsResponseSchema
>;

export type IExpenseGetRequestDto = z.infer<typeof ExpenseGetRequestSchema>;

export type IExpenseActionRequestDto = z.infer<
  typeof ExpenseActionRequestSchema
>;

export type IExpenseActionResponseDto = z.infer<
  typeof ExpenseActionResponseSchema
>;

export type IExpenseDeleteRequestDto = z.infer<
  typeof ExpenseDeleteRequestSchema
>;

export type IExpenseDeleteResponseDto = z.infer<
  typeof ExpenseDeleteResponseSchema
>;
