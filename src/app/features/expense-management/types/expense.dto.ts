import { z } from 'zod';
import {
  ExpenseGetBaseResponseSchema,
  ExpenseGetRequestSchema,
  ExpenseGetStatsResponseSchema,
  ExpenseGetResponseSchema,
} from '../schemas';

export type IExpenseGetBaseResponseDto = z.infer<
  typeof ExpenseGetBaseResponseSchema
>;

export type IExpenseGetResponseDto = z.infer<typeof ExpenseGetResponseSchema>;

export type IExpenseGetStatsResponseDto = z.infer<
  typeof ExpenseGetStatsResponseSchema
>;

export type IExpenseGetRequestDto = z.infer<typeof ExpenseGetRequestSchema>;
