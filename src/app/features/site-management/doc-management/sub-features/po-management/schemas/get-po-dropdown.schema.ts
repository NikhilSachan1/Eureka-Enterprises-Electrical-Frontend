import { z } from 'zod';
import { uuidField } from '@shared/schemas';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';

export const PoDropdownGetRequestSchema = z
  .object({
    projectName: uuidField,
    docType: z.enum(EDocContext),
  })
  .transform(({ projectName, docType }) => {
    return {
      siteId: projectName,
      partyType: docType,
    };
  });

const PoDropdownAdvancePaymentMetaSchema = z.looseObject({
  amount: z.union([z.string(), z.number()]).optional(),
  settled: z.union([z.string(), z.number()]).optional(),
  remaining: z.union([z.string(), z.number()]).optional(),
});

const PoDropdownMetaSchema = z.looseObject({
  poNumber: z.string(),
  totalAmount: z.number(),
  invoicedTotal: z.number(),
  remaining: z.number(),
  advancePayment: PoDropdownAdvancePaymentMetaSchema.optional(),
});

export const PoDropdownRecordSchema = z.looseObject({
  id: uuidField,
  label: z.string(),
  eligible: z.boolean(),
  reason: z.string().nullable(),
  meta: PoDropdownMetaSchema,
});

export const PoDropdownGetResponseSchema = z.object({
  records: z.array(PoDropdownRecordSchema),
});
