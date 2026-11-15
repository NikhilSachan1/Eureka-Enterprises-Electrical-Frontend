import { EExpenseCategory } from '@features/expense-management/types/expense.enum';
import { dateField, uuidField } from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';
import * as z from 'zod';

export const PayPaymentSheetItemRequestSchema = z
  .object({
    paymentMode: z.string().trim().nullable(),
    paidFromAccount: uuidField.nullable(),
    paidDate: dateField,
    transactionId: z.string().trim().nullable(),
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

      // Cash has no source account and no UTR — always sent as null, whatever the form held.
      const isCash = (paymentMode ?? '').toLowerCase() === 'cash';

      return {
        paymentMode: paymentMode ?? '',
        paidFromAccountId: isCash ? null : (paidFromAccount ?? null),
        category: EExpenseCategory.SETTLEMENT,
        paidDate: transferDate,
        transactionId: isCash ? null : transactionId?.trim() || null,
      };
    }
  );

export const PayPaymentSheetItemResponseSchema = z.looseObject({
  message: z.string(),
});
