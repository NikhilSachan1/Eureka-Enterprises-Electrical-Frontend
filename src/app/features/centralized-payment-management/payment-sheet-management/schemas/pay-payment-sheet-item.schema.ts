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
    bookPaymentId: z.array(uuidField).optional(),
  })
  .strict()
  .transform(
    ({ paidDate, paidFromAccount, transactionId, bookPaymentId, ...rest }) => {
      const transferDate = transformDateFormat(paidDate);

      if (bookPaymentId?.length) {
        return {
          paidFromAccountId: paidFromAccount ?? null,
          transfers: bookPaymentId.map(id => ({
            bookPaymentId: id,
            utrNumber: transactionId,
            transferDate,
          })),
        };
      }

      return {
        ...rest,
        transactionId,
        paidFromAccountId: paidFromAccount ?? null,
        category: EExpenseCategory.SETTLEMENT,
        paidDate: transferDate,
      };
    }
  );

export const PayPaymentSheetItemResponseSchema = z.looseObject({
  message: z.string(),
});
