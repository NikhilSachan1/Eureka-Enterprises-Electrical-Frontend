import {
  dateField,
  AuditSchema,
  FilterSchema,
  uuidField,
} from '@shared/schemas';
import z from 'zod';
import { ReportBaseSchema } from './base-report.schema';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { transformDateFormat } from '@shared/utility';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;
const { createdBy } = AuditSchema.shape;

export const ReportGetRequestSchema = z
  .object({
    projectName: uuidField.nullable().optional(),
    companyName: z.array(uuidField).nullable().optional(),
    docType: z.enum(EDocContext).optional(),
    contractorName: z.array(uuidField).nullable().optional(),
    vendorName: z.array(uuidField).nullable().optional(),
    dateRange: z.array(dateField).nullable().optional(),
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

export const ReportGetBaseResponseSchema = z.looseObject({
  ...ReportBaseSchema.shape,
  remarks: z.string().nullable(),
  createdBy,
  site: z.looseObject({
    name: z.string(),
    city: z.string(),
    state: z.string(),
    company: z.looseObject({
      name: z.string(),
    }),
  }),
  jmc: z.looseObject({
    jmcNumber: z.string(),
    po: z.looseObject({
      poNumber: z.string(),
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

export const ReportGetResponseSchema = z.looseObject({
  records: z.array(ReportGetBaseResponseSchema),
  totalRecords: z.number().int().nonnegative(),
});
