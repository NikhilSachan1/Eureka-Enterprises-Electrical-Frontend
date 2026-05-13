import { FilterSchema, uuidField } from '@shared/schemas';
import z from 'zod';
import { ReportBaseSchema } from './base-report.schema';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const ReportGetRequestSchema = z
  .object({
    projectName: uuidField.nullable().optional(),
    docType: z.enum(EDocContext).optional(),
    contractorName: z.array(uuidField).nullable().optional(),
    vendorName: z.array(uuidField).nullable().optional(),
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

export const ReportGetBaseResponseSchema = z.looseObject({
  ...ReportBaseSchema.shape,
  remarks: z.string().nullable(),
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
