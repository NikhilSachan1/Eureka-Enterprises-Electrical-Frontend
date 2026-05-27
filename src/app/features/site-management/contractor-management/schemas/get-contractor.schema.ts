import { z } from 'zod';
import { AuditSchema, FilterSchema } from '@shared/schemas';
import { ContractorBaseSchema } from './base-contractor.schema';

const { sortOrder, sortField, pageSize, page } = FilterSchema.shape;

export const ContractorGetRequestSchema = z
  .object({
    contractorState: z.array(z.string()).optional(),
    contractorCity: z.array(z.string()).optional(),
    contractorStatus: z.string().optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
  })
  .strict()
  .transform(
    ({ contractorState, contractorCity, contractorStatus, ...rest }) => {
      return {
        ...rest,
        city: contractorCity,
        state: contractorState,
        isActive: contractorStatus,
      };
    }
  );

export const ContractorGetBaseResponseSchema = ContractorBaseSchema.extend({
  ...AuditSchema.shape,
  fullAddress: z.string().nullable(),
  isSelfContractor: z.boolean(),
}).loose();

export const ContractorGetStatsResponseSchema = z.looseObject({
  totalContractors: z.number().int().nonnegative(),
  activeContractors: z.number().int().nonnegative(),
  inactiveContractors: z.number().int().nonnegative(),
});

export const ContractorGetResponseSchema = z.looseObject({
  records: z.array(ContractorGetBaseResponseSchema),
  overallStats: ContractorGetStatsResponseSchema,
  totalRecords: z.number().int().nonnegative(),
});
