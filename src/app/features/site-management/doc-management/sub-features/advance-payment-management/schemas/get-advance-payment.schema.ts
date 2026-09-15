import { FilterSchema, isoDateTimeField, UserSchema, uuidField } from '@shared/schemas';
import { makeFieldsNullable } from '@shared/utility';
import z from 'zod';

const { pageSize, page, search } = FilterSchema.shape;

export const AdvancePaymentGetRequestSchema = z
  .object({
    projectName: uuidField.nullable().optional(),
    companyName: z.array(uuidField).nullable().optional(),
    vendorName: z.array(uuidField).nullable().optional(),
    approvalStatus: z.array(z.string()).nullable().optional(),
    poNumber: z.string().nullable().optional(),
    pageSize,
    page,
    search,
  })
  .transform(
    ({
      projectName,
      companyName,
      vendorName,
      approvalStatus,
      poNumber,
      page: requestPage,
      pageSize: requestPageSize,
      search: requestSearch,
    }) => {
      return {
        siteId: projectName ? [projectName] : undefined,
        companyId: companyName?.length ? companyName : undefined,
        vendorId: vendorName?.length ? vendorName : undefined,
        poNumber:
          poNumber === null || poNumber === undefined || poNumber === ''
            ? undefined
            : poNumber,
        approvalStatus: approvalStatus?.length ? approvalStatus : undefined,
        search:
          requestSearch === null ||
          requestSearch === undefined ||
          requestSearch === ''
            ? undefined
            : requestSearch,
        page: requestPage,
        pageSize: requestPageSize,
      };
    }
  );

const nullableAmountField = z.union([z.string(), z.number()]).nullable();

const AdvancePaymentPartySchema = z.looseObject({
  id: uuidField.optional(),
  name: z.string().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
});

const AdvancePaymentPoSchema = z.looseObject({
  id: uuidField.optional(),
  poNumber: z.string().optional(),
  poDate: z.string().nullable().optional(),
  taxableAmount: nullableAmountField.optional(),
  gstAmount: nullableAmountField.optional(),
  gstPercentage: nullableAmountField.optional(),
  totalAmount: nullableAmountField.optional(),
});

export const AdvancePaymentGetBaseResponseSchema = z.looseObject({
  id: uuidField,
  advanceNumber: z.string().nullable().optional(),
  vendorAdvanceNumber: z.string().nullable().optional(),
  poId: uuidField.nullable().optional(),
  poNumber: z.string().nullable().optional(),
  siteId: uuidField.nullable().optional(),
  siteName: z.string().nullable().optional(),
  vendorId: uuidField.nullable().optional(),
  vendorName: z.string().nullable().optional(),
  advanceDate: z.string().nullable().optional(),
  amount: z.union([z.string(), z.number()]),
  settledAmount: nullableAmountField.optional(),
  balanceAmount: nullableAmountField.optional(),
  isFullySettled: z.boolean().optional(),
  fileKey: z.string().nullable().optional(),
  fileName: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
  approvalStatus: z.string(),
  approvalAt: isoDateTimeField.nullable().optional(),
  rejectionReason: z.string().nullable().optional(),
  hasBookPayment: z.boolean().optional(),
  createdAt: isoDateTimeField.optional(),
  createdByUser: UserSchema.nullable().optional(),
  approvalByUser: makeFieldsNullable(UserSchema).nullable().optional(),
  site: AdvancePaymentPartySchema.nullable().optional(),
  company: AdvancePaymentPartySchema.nullable().optional(),
  vendor: AdvancePaymentPartySchema.nullable().optional(),
  po: AdvancePaymentPoSchema.nullable().optional(),
});

export const AdvancePaymentGetResponseSchema = z.looseObject({
  records: z.array(AdvancePaymentGetBaseResponseSchema),
  totalRecords: z.number().int().nonnegative(),
});
