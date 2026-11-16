import * as z from 'zod';
import { uuidField } from '@shared/schemas';
import { roundCurrencyAmount } from '@shared/utility/number.util';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';

export const InvoiceDropdownGetRequestSchema = z
  .object({
    projectName: uuidField,
    docType: z.enum(EDocContext),
    forDocument: z.enum(['book-payment', 'bank-transfer']),
  })
  .transform(({ projectName, docType, forDocument }) => ({
    siteId: projectName,
    partyType: docType,
    forDocument,
  }));

/** Amounts are rounded to paise so a float tail never reaches the form or a comparison. */
const moneyField = z.number().transform(roundCurrencyAmount);

const InvoiceDropdownMetaSchema = z.looseObject({
  taxableAmount: moneyField,
  gstAmount: moneyField,
  tdsAmount: moneyField,
  totalAmount: moneyField,
  isGstHold: z.boolean().optional(),
  bookedTotal: moneyField.optional(),
  paidTotal: moneyField.optional(),
  advanceSettledAmount: moneyField.optional(),
  remaining: moneyField.optional(),
});

export const InvoiceDropdownRecordSchema = z.looseObject({
  id: uuidField,
  label: z.string(),
  eligible: z.boolean(),
  reason: z.string().nullable(),
  meta: InvoiceDropdownMetaSchema,
});

export const InvoiceDropdownGetResponseSchema = z.object({
  records: z.array(InvoiceDropdownRecordSchema),
});
