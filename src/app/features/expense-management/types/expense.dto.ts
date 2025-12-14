import { z } from 'zod';
import {
  ExpenseGetBaseResponseSchema,
  ExpenseGetRequestSchema,
  ExpenseGetStatsResponseSchema,
  ExpenseGetResponseSchema,
  ExpenseAddRequestSchema,
  ExpenseAddResponseSchema,
  ExpenseActionRequestSchema,
  ExpenseActionResponseSchema,
  ExpenseDeleteRequestSchema,
  ExpenseDeleteResponseSchema,
  ExpenseDetailGetResponseSchema,
  ExpenseDetailGetRequestSchema,
  ExpenseEditResponseSchema,
  ExpenseEditRequestSchema,
  ExpenseForceResponseSchema,
  ExpenseForceRequestSchema,
} from '../schemas';

export type IExpenseGetBaseResponseDto = z.infer<
  typeof ExpenseGetBaseResponseSchema
>;

export type IExpenseGetResponseDto = z.infer<typeof ExpenseGetResponseSchema>;

export type IExpenseGetStatsResponseDto = z.infer<
  typeof ExpenseGetStatsResponseSchema
>;

export type IExpenseGetRequestDto = z.infer<typeof ExpenseGetRequestSchema>;

export type IExpenseDetailGetRequestDto = z.infer<
  typeof ExpenseDetailGetRequestSchema
>;

export type IExpenseDetailGetResponseDto = z.infer<
  typeof ExpenseDetailGetResponseSchema
>;

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

export type IExpenseAddRequestDto = z.infer<typeof ExpenseAddRequestSchema>;

export type IExpenseAddResponseDto = z.infer<typeof ExpenseAddResponseSchema>;

export type IExpenseEditRequestDto = z.infer<typeof ExpenseEditRequestSchema>;

export type IExpenseEditResponseDto = z.infer<typeof ExpenseEditResponseSchema>;

export type IExpenseForceRequestDto = z.infer<typeof ExpenseForceRequestSchema>;

export type IExpenseForceResponseDto = z.infer<
  typeof ExpenseForceResponseSchema
>;
