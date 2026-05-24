import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import {
  dateField,
  FilterSchema,
  isoDateTimeField,
  onlyDateStringField,
  uuidField,
} from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';
import z from 'zod';

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
        dateFrom: transformDateFormat(start),
        dateTo: transformDateFormat(end),
      };
    }
  );

export const GstEntryGetBaseResponseSchema = z.looseObject({
  id: uuidField,
  partyType: z.enum(EDocContext),
  invoiceMonth: z.string(),
  gstType: z.string(),
  taxableAmount: z.string(),
  gstAmount: z.string(),
  isVerified: z.boolean(),
  verifiedAt: isoDateTimeField.nullable(),
  verifiedBy: uuidField.nullable(),
  gstPaymentId: uuidField.nullable(),
  invoice: z.looseObject({
    invoiceNumber: z.string(),
    invoiceDate: onlyDateStringField,
    jmc: z
      .looseObject({
        jmcNumber: z.string(),
        po: z.looseObject({
          poNumber: z.string(),
        }),
      })
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
