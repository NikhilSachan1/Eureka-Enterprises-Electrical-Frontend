import { z } from 'zod';
import {
  ExpenseGetBaseResponseSchema,
  ExpenseGetRequestSchema,
  ExpenseGetStatsResponseSchema,
  ExpenseGetResponseSchema,
  ExpenseAddRequestSchema,
  ExpenseAddResponseSchema,
  ExpenseActionRequestSchema,
  ExpenseDeleteRequestSchema,
  ExpenseDeleteResponseSchema,
  ExpenseDetailGetResponseSchema,
  ExpenseDetailGetRequestSchema,
  ExpenseEditResponseSchema,
  ExpenseEditRequestSchema,
  ExpenseForceResponseSchema,
  ExpenseForceRequestSchema,
  ExpenseReimburseResponseSchema,
  ExpenseReimburseRequestSchema,
} from '../schemas';
import { ExpenseActionResponseSchema } from '../schemas/approval-action-expense.schema';

/*
  Expense Get
*/

export type IExpenseGetBaseResponseDto = z.infer<
  typeof ExpenseGetBaseResponseSchema
>;
export type IExpenseGetResponseDto = z.infer<typeof ExpenseGetResponseSchema>;
export type IExpenseGetStatsResponseDto = z.infer<
  typeof ExpenseGetStatsResponseSchema
>;
export type IExpenseGetRequestDto = z.infer<typeof ExpenseGetRequestSchema>;
export type IExpenseGetFormDto = z.input<typeof ExpenseGetRequestSchema>;

/*
  Expense Detail Get
*/

export type IExpenseDetailGetRequestDto = z.infer<
  typeof ExpenseDetailGetRequestSchema
>;
export type IExpenseDetailGetFormDto = z.input<
  typeof ExpenseDetailGetRequestSchema
>;
export type IExpenseDetailGetResponseDto = z.infer<
  typeof ExpenseDetailGetResponseSchema
>;

/*
  Expense Action
*/

export type IExpenseActionRequestDto = z.infer<
  typeof ExpenseActionRequestSchema
>;
export type IExpenseActionFormDto = z.input<typeof ExpenseActionRequestSchema>;
export type IExpenseActionUIFormDto = Pick<IExpenseActionFormDto, 'remark'>;
export type IExpenseActionResponseDto = z.infer<
  typeof ExpenseActionResponseSchema
>;

/*
  Expense Delete
*/

export type IExpenseDeleteRequestDto = z.infer<
  typeof ExpenseDeleteRequestSchema
>;
export type IExpenseDeleteFormDto = z.input<typeof ExpenseDeleteRequestSchema>;
export type IExpenseDeleteResponseDto = z.infer<
  typeof ExpenseDeleteResponseSchema
>;

/*
  Expense Add
*/

export type IExpenseAddRequestDto = z.infer<typeof ExpenseAddRequestSchema>;
export type IExpenseAddFormDto = z.input<typeof ExpenseAddRequestSchema>;
export type IExpenseAddResponseDto = z.infer<typeof ExpenseAddResponseSchema>;

/*
  Expense Edit
*/

export type IExpenseEditRequestDto = z.infer<typeof ExpenseEditRequestSchema>;
export type IExpenseEditFormDto = z.input<typeof ExpenseEditRequestSchema>;
export type IExpenseEditResponseDto = z.infer<typeof ExpenseEditResponseSchema>;

/*
  Expense Force
*/

export type IExpenseForceRequestDto = z.infer<typeof ExpenseForceRequestSchema>;
export type IExpenseForceFormDto = z.input<typeof ExpenseForceRequestSchema>;
export type IExpenseForceResponseDto = z.infer<
  typeof ExpenseForceResponseSchema
>;

/*
  Expense Reimburse
*/

export type IExpenseReimburseRequestDto = z.infer<
  typeof ExpenseReimburseRequestSchema
>;
export type IExpenseReimburseFormDto = z.input<
  typeof ExpenseReimburseRequestSchema
>;
export type IExpenseReimburseResponseDto = z.infer<
  typeof ExpenseReimburseResponseSchema
>;
