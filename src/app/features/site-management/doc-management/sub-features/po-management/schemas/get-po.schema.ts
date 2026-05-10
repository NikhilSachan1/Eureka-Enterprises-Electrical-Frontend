import { FilterSchema, isoDateTimeField, uuidField } from '@shared/schemas';
import z from 'zod';
import { PoBaseSchema } from './base-po.schema';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const PoGetRequestSchema = z
  .object({
    projectName: z.array(uuidField).nullable().optional(),
    docType: z.enum(EDocContext).optional(),
    contractorName: z.array(uuidField).nullable().optional(),
    vendorName: z.array(uuidField).nullable().optional(),
    approvalStatus: z.array(z.string()).nullable().optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict()
  .transform(
    ({ projectName, docType, contractorName, vendorName, ...rest }) => {
      return {
        ...rest,
        siteId: projectName,
        partyType: docType,
        contractorId: contractorName,
        vendorId: vendorName,
      };
    }
  );

export const PoGetBaseResponseSchema = z.looseObject({
  ...PoBaseSchema.shape,
  isLocked: z.boolean(),
  unlockRequestedAt: isoDateTimeField.nullable(),
  unlockRequestedBy: uuidField.nullable(),
  unlockReason: z.string().nullable(),
  invoicedTotal: z.string(),
  bookedTotal: z.string(),
  paidTotal: z.string(),
  lastInvoiceAt: isoDateTimeField.nullable(),
  lastPaymentAt: isoDateTimeField.nullable(),
  remarks: z.string().nullable(),
  approvalStatus: z.string(),
  contractor: z
    .looseObject({
      name: z.string(),
    })
    .nullable(),
  vendor: z
    .looseObject({
      name: z.string(),
    })
    .nullable(),
});

export const PoGetResponseSchema = z.looseObject({
  records: z.array(PoGetBaseResponseSchema),
  totalRecords: z.number().int().nonnegative(),
});
