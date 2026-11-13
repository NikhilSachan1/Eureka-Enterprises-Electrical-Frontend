import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import {
  dateField,
  FilterSchema,
  isoDateTimeField,
  onlyDateStringField,
  uuidField,
} from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';
import * as z from 'zod';

const { sortOrder, sortField, pageSize, page } = FilterSchema.shape;

export const GstEntryGetRequestSchema = z
  .object({
    projectName: uuidField.nullable().optional(),
    contractorName: z.array(uuidField).nullable().optional(),
    vendorName: z.array(uuidField).nullable().optional(),
    partyType: z.enum(EDocContext).optional(),
    verificationStatus: z
      .union([z.boolean(), z.literal('true'), z.literal('false')])
      .nullable()
      .optional(),
    settlementStatus: z
      .enum(['PENDING', 'IN_PROCESS', 'SETTLED', 'NOT_HELD'])
      .nullable()
      .optional(),
    dateRange: z.array(dateField).nullable().optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
  })
  .strict()
  .transform(
    ({
      projectName,
      contractorName,
      vendorName,
      partyType,
      verificationStatus,
      settlementStatus,
      dateRange,
      ...rest
    }) => {
      const [start, end] = dateRange ?? [];
      return {
        ...rest,
        siteId: projectName,
        contractorId: contractorName,
        vendorId: vendorName,
        partyType,
        isVerified:
          verificationStatus === null || verificationStatus === undefined
            ? undefined
            : typeof verificationStatus === 'boolean'
              ? verificationStatus
              : verificationStatus === 'true',
        settlementStatus: settlementStatus ?? undefined,
        dateFrom: transformDateFormat(start),
        dateTo: transformDateFormat(end),
      };
    }
  );

export const GstEntryGetBaseResponseSchema = z.looseObject({
  id: uuidField,
  partyType: z.enum(EDocContext),
  siteId: uuidField,
  contractorId: uuidField.nullable(),
  vendorId: uuidField.nullable(),
  gstType: z.string(),
  taxableAmount: z.string(),
  gstAmount: z.string(),
  /** true → GST was withheld and is settled through this register. */
  isGstHold: z.boolean().default(true),
  /** Matched on the GST portal (GSTR-2B purchase / GSTR-1 sale). */
  isVerified: z.boolean(),
  verifiedAt: isoDateTimeField.nullable(),
  verifiedBy: uuidField.nullable(),
  verifyFileKey: z.string().nullable(),
  gstPaymentId: uuidField.nullable(),
  /** Purchase: GST release booked — "release in process" until its bank transfer is done. */
  gstBookPaymentId: uuidField.nullable().optional(),
  gstBookPayment: z
    .looseObject({
      bookingDate: z.string().nullable(),
      paymentTotalAmount: z.string(),
      hasTransfer: z.boolean(),
      remarks: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  /** The bank transfer that moved the held GST (release to vendor / receipt from client). */
  gstBankTransferId: uuidField.nullable().optional(),
  gstBankTransfer: z
    .looseObject({
      utrNumber: z.string().nullable(),
      transferDate: z.string().nullable(),
      transferAmount: z.string(),
      proofFileKey: z.string().nullable(),
      remarks: z.string().nullable().optional(),
      paymentAdvice: z
        .looseObject({ referenceNumber: z.string().nullable() })
        .nullable()
        .optional(),
    })
    .nullable()
    .optional(),
  /** Legacy: settlement recorded directly, before GST moved through book payment / bank transfer. */
  gstPayment: z
    .looseObject({
      utrNumber: z.string().nullable(),
      paymentDate: z.string().nullable(),
      paymentAdviceReferenceNumber: z.string().nullable().optional(),
      fileKey: z.string().nullable(),
      remarks: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  invoice: z.looseObject({
    invoiceNumber: z.string().nullable(),
    invoiceDate: onlyDateStringField,
    /** GST rate of the invoice (varies per invoice). */
    gstPercentage: z.union([z.string(), z.number()]).nullable().optional(),
    jmc: z
      .looseObject({
        jmcNumber: z.string().nullable(),
        po: z
          .looseObject({
            poNumber: z.string(),
          })
          .nullable()
          .optional(),
      })
      .nullable()
      .optional(),
  }),
  site: z.looseObject({
    name: z.string(),
    city: z.string(),
    state: z.string(),
    company: z.looseObject({
      name: z.string(),
    }),
  }),
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

export const GstEntryGetResponseSchema = z.looseObject({
  records: z.array(GstEntryGetBaseResponseSchema),
  totalRecords: z.number().int().nonnegative(),
});
