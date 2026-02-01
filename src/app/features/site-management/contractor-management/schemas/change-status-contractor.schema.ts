import { z } from 'zod';
import { EContractorStatus } from '../types/contractor.enum';
import { ContractorEditResponseSchema } from './edit-contractor.schema';

export const ContractorChangeStatusRequestSchema = z
  .object({
    contractorStatus: z.string(),
  })
  .strict()
  .transform(data => ({
    isActive: data.contractorStatus === EContractorStatus.ACTIVE ? true : false,
  }));

export const ContractorChangeStatusResponseSchema =
  ContractorEditResponseSchema;
