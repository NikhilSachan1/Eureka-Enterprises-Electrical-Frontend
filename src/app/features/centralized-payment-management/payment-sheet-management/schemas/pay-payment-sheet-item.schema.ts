import { EExpenseCategory } from '@features/expense-management/types/expense.enum';
import { dateField } from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';
import z from 'zod';

export const PayPaymentSheetItemRequestSchema = z
  .object({
    paymentMode: z.string().trim().min(1),
    paidDate: dateField,
    transactionId: z.string().trim().min(1),
  })
  .strict()
  .transform(({ paidDate, ...rest }) => ({
    ...rest,
    category: EExpenseCategory.SETTLEMENT,
    paidDate: transformDateFormat(paidDate),
  }));

export const PayPaymentSheetItemResponseSchema = z.looseObject({
  message: z.string(),
});
