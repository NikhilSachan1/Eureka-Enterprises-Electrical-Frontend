import { EExpenseCategory } from '@features/expense-management/types/expense.enum';
import { dateField, uuidField } from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';
import z from 'zod';

export const PayPaymentSheetItemRequestSchema = z
  .object({
    paymentMode: z.string().trim().min(1).optional(),
    paidFromAccount: uuidField.nullable(),
    paidDate: dateField,
    transactionId: z.string().trim().min(1),
    bookPaymentId: uuidField.optional(),
  })
  .strict()
  .transform(
    ({
      paidDate,
      paidFromAccount,
      transactionId,
      bookPaymentId,
      paymentMode,
    }) => {
      const transferDate = transformDateFormat(paidDate);

      if (bookPaymentId && paidFromAccount) {
        return {
          paidFromAccountId: paidFromAccount,
          transfers: [
            {
              bookPaymentId,
              utrNumber: transactionId,
              transferDate,
            },
          ],
        };
      }

      return {
        paymentMode: paymentMode ?? '',
        paidFromAccountId: paidFromAccount ?? null,
        category: EExpenseCategory.SETTLEMENT,
        paidDate: transferDate,
        transactionId,
      };
    }
  );

export const PayPaymentSheetItemResponseSchema = z.looseObject({
  message: z.string(),
});
