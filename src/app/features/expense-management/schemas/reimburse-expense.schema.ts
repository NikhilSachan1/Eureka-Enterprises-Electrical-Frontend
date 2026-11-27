import * as z from 'zod';
import { EExpenseCategory } from '../types/expense.enum';
import { ExpenseUpsertShapeSchema } from './base-expense.schema';
import { uuidField } from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';
import {
  DirectPaymentSheetRefSchema,
  PaymentRecordModeField,
} from '@features/centralized-payment-management/payment-sheet-management/schemas/direct-payment-sheet.schema';

const { transactionId } = ExpenseUpsertShapeSchema.shape;

export const ExpenseReimburseRequestSchema = ExpenseUpsertShapeSchema.omit({
  expenseCategory: true,
})
  .extend({
    employeeName: uuidField,
    paidFromAccount: uuidField.nullable(),
    transactionId: transactionId.unwrap(),
    remark: z.string().nullable(),
    // Picks the endpoint in the service; not part of the body.
    recordMode: PaymentRecordModeField,
  })
  .strict()
  .transform(data => {
    return {
      userId: data.employeeName,
      category: EExpenseCategory.SETTLEMENT,
      description: data.remark ?? 'N/A',
      amount: data.expenseAmount,
      expenseDate: transformDateFormat(data.expenseDate),
      paymentMode: data.paymentMode,
      paidFromAccountId: data.paidFromAccount ?? null,
      files: data.expenseAttachments,
      transactionId: data.transactionId,
    };
  });

export const ExpenseReimburseResponseSchema = z.looseObject({
  message: z.string(),
  paymentSheet: DirectPaymentSheetRefSchema,
});
