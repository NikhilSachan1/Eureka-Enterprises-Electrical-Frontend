import { z } from 'zod';
import { salaryBaseSchema } from './base-salary.schema';

export const SalaryEditRequestSchema = z
  .object({
    ...salaryBaseSchema.shape,
    comments: z.string(),
  })
  .strict()
  .transform(data => ({
    basic: data.basicSalary,
    hra: data.hra,
    tds: data.tds,
    esic: data.employerEsicContribution,
    employeePf: data.employeePfContribution,
    employerPf: data.employeePfContribution,
    foodAllowance: data.foodAllowance,
    remarks: data.comments,

    // To be removed after testing
    conveyanceAllowance: 0,
    medicalAllowance: 0,
    specialAllowance: 0,
    professionalTax: 0,
  }));

export const SalaryEditResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
