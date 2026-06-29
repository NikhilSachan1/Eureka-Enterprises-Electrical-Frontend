import { z } from 'zod';
import {
  ExpenseOutstandingGetBaseResponseSchema,
  ExpenseOutstandingGetRequestSchema,
  ExpenseOutstandingGetResponseSchema,
  ExpenseOutstandingGetStatsResponseSchema,
} from '../schemas';

export type IExpenseOutstandingGetBaseResponseDto = z.infer<
  typeof ExpenseOutstandingGetBaseResponseSchema
>;
export type IExpenseOutstandingGetStatsResponseDto = z.infer<
  typeof ExpenseOutstandingGetStatsResponseSchema
>;
export type IExpenseOutstandingGetResponseDto = z.infer<
  typeof ExpenseOutstandingGetResponseSchema
>;
export type IExpenseOutstandingGetFormDto = z.input<
  typeof ExpenseOutstandingGetRequestSchema
>;
