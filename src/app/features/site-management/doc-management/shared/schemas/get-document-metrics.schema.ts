import { dateField, uuidField } from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';
import * as z from 'zod';
import { EDocContext } from '../../types/doc.enum';

/**
 * Workspace filters → document metrics query. Every filter is optional: with none the metrics
 * cover all the sites the user can read.
 */
export const DocumentMetricsGetRequestSchema = z
  .object({
    projectName: uuidField.nullable().optional(),
    companyName: z.array(uuidField).nullable().optional(),
    contractorName: z.array(uuidField).nullable().optional(),
    vendorName: z.array(uuidField).nullable().optional(),
    dateRange: z.array(dateField).nullable().optional(),
    docType: z.nativeEnum(EDocContext).nullable().optional(),
  })
  .transform(
    ({
      projectName,
      companyName,
      contractorName,
      vendorName,
      dateRange,
      docType,
    }) => {
      const [start, end] = dateRange ?? [];
      return {
        ...(projectName ? { siteId: [projectName] } : {}),
        ...(companyName?.length ? { companyId: companyName } : {}),
        ...(contractorName?.length ? { contractorId: contractorName } : {}),
        ...(vendorName?.length ? { vendorId: vendorName } : {}),
        ...(docType ? { partyType: docType } : {}),
        ...(start ? { dateFrom: transformDateFormat(start) } : {}),
        ...(end ? { dateTo: transformDateFormat(end) } : {}),
      };
    }
  );

const ApprovalCountsSchema = z.looseObject({
  total: z.number(),
  approved: z.number(),
  pending: z.number(),
  rejected: z.number(),
});

/** Open unlock requests on a document type. */
const UnlockSchema = { unlockRequests: z.number() };

export const DocumentMetricsGetResponseSchema = z.looseObject({
  po: ApprovalCountsSchema.extend(UnlockSchema),
  jmc: ApprovalCountsSchema.extend({
    ...UnlockSchema,
    signedCopyMissing: z.number(),
  }),
  /** Reports have no approval step. */
  report: z.looseObject({ total: z.number(), ...UnlockSchema }),
  invoice: ApprovalCountsSchema.extend({
    ...UnlockSchema,
    gstPendingCount: z.number(),
    tdsPendingCount: z.number(),
    paymentPendingCount: z.number(),
  }),
  bookPayment: z.looseObject({
    total: z.number(),
    ...UnlockSchema,
    /** Approved bookings still waiting for their bank transfer. */
    transferPendingCount: z.number(),
  }),
  advance: ApprovalCountsSchema.extend({
    unadjustedCount: z.number(),
    unadjustedAmount: z.number(),
  }),
});

export type IDocumentMetricsGetFormDto = z.input<
  typeof DocumentMetricsGetRequestSchema
>;
export type IDocumentMetricsGetResponseDto = z.infer<
  typeof DocumentMetricsGetResponseSchema
>;
