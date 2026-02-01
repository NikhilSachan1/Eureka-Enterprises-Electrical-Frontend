import { z } from 'zod';
import { AuditSchema, FilterSchema } from '@shared/schemas';
import { ContractorBaseSchema } from './base-contractor.schema';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const ContractorGetRequestSchema = z
  .object({
    contractorState: z.array(z.string()).optional(),
    contractorCity: z.array(z.string()).optional(),
    contractorStatus: z.string().optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
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
}).strict();

export const ContractorGetStatsResponseSchema = z
  .object({
    totalContractors: z.number().int().nonnegative(),
    activeContractors: z.number().int().nonnegative(),
    archivedContractors: z.number().int().nonnegative(),
    inactiveContractors: z.number().int().nonnegative(),
  })
  .strict();

export const ContractorLevelGetStatsResponseSchema = z
  .object({
    activeSites: z.number().int().nonnegative(),
    completedSites: z.number().int().nonnegative(),
    holdSites: z.number().int().nonnegative(),
    totalSites: z.number().int().nonnegative(),
    upcomingSites: z.number().int().nonnegative(),
  })
  .strict();

export const ContractorGetResponseSchema = z
  .object({
    records: z.array(
      ContractorGetBaseResponseSchema.extend({
        stats: ContractorLevelGetStatsResponseSchema.strict().nullable(),
      }).strict()
    ),
    overallStats: ContractorGetStatsResponseSchema.strict(),
    totalRecords: z.number().int().nonnegative(),
  })
  .strict();
