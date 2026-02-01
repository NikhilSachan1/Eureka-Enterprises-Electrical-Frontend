import { z } from 'zod';
import { ECompanyStatus } from '../types/company.enum';
import { CompanyEditResponseSchema } from './edit-company.schema';

export const CompanyChangeStatusRequestSchema = z
  .object({
    companyStatus: z.string(),
  })
  .strict()
  .transform(data => ({
    isActive: data.companyStatus === ECompanyStatus.ACTIVE ? true : false,
  }));

export const CompanyChangeStatusResponseSchema = CompanyEditResponseSchema;
