import {
  dateField,
  AuditSchema,
  FilterSchema,
  isoDateTimeField,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import z from 'zod';
import { JmcBaseSchema } from './base-jmc.schema';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { makeFieldsNullable, transformDateFormat } from '@shared/utility';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;
const { createdBy } = AuditSchema.shape;

export const JmcItemGetResponseSchema = z.looseObject({
  itemName: z.string(),
  unit: z.string(),
  quantity: z.string(),
});

export const JmcGetRequestSchema = z
  .object({
    projectName: uuidField.nullable().optional(),
    companyName: z.array(uuidField).nullable().optional(),
    docType: z.enum(EDocContext).optional(),
    contractorName: z.array(uuidField).nullable().optional(),
    vendorName: z.array(uuidField).nullable().optional(),
    approvalStatus: z.array(z.string()).nullable().optional(),
    dateRange: z.array(dateField).nullable().optional(),
    poNumber: z.string().nullable().optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict()
  .transform(
    ({
      projectName,
      companyName,
      docType,
      contractorName,
      vendorName,
      dateRange,
      ...rest
    }) => {
      const [start, end] = dateRange ?? [];
      return {
        ...rest,
        siteId: projectName,
        companyId: companyName,
        partyType: docType,
        contractorId: contractorName,
        vendorId: vendorName,
        dateFrom: transformDateFormat(start),
        dateTo: transformDateFormat(end),
      };
    }
  );

export const JmcGetBaseResponseSchema = z.looseObject({
  ...JmcBaseSchema.shape,
  isSystemGenerated: z.boolean(),
  items: z.array(JmcItemGetResponseSchema).nullable().optional(),
  isLocked: z.boolean(),
  unlockRequestedAt: isoDateTimeField.nullable(),
  unlockRequestedByUser: makeFieldsNullable(UserSchema).nullable(),
  unlockReason: z.string().nullable(),
  remarks: z.string().nullable(),
  approvalStatus: z.string(),
  createdBy,
  po: z.looseObject({
    poNumber: z.string(),
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

export const JmcGetResponseSchema = z.looseObject({
  records: z.array(JmcGetBaseResponseSchema),
  totalRecords: z.number().int().nonnegative(),
});
