import { EExpenseCategory } from '@features/expense-management/types/expense.enum';
import { dateField, uuidField } from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';
import z from 'zod';

export const PayPaymentSheetItemRequestSchema = z
  .object({
    paymentMode: z.string().trim().min(1),
    paidFromAccount: uuidField.nullable(),
    paidDate: dateField,
    transactionId: z.string().trim().min(1),
  })
  .strict()
  .transform(({ paidDate, paidFromAccount, ...rest }) => ({
    ...rest,
    paidFromAccountId: paidFromAccount ?? null,
    category: EExpenseCategory.SETTLEMENT,
    paidDate: transformDateFormat(paidDate),
  }));

export const PayPaymentSheetItemResponseSchema = z.looseObject({
  message: z.string(),
});
