import { z } from 'zod';
import { dateField, uuidField } from '@shared/schemas';
import { ESalaryIncrementType } from '../types/payroll.enum';
import { transformDateFormat } from '@shared/utility';
import { salaryBaseSchema } from './base-salary.schema';

export const SalaryIncrementAddRequestSchema = z
  .object({
    employeeName: uuidField,
    ...salaryBaseSchema.shape,
    incrementStartDate: dateField,
    comments: z.string(),
  })
  .strict()
  .transform(data => ({
    userId: data.employeeName,
    basic: data.basicSalary,
    hra: data.hra,
    tds: data.tds,
    esic: data.employerEsicContribution,
    employeePf: data.employeePfContribution,
    employerPf: data.employeePfContribution,
    foodAllowance: data.foodAllowance,
    incrementType: ESalaryIncrementType.ANNUAL,
    effectiveFrom: transformDateFormat(data.incrementStartDate),
    remarks: data.comments,

    // To be removed after testing
    conveyanceAllowance: 0,
    medicalAllowance: 0,
    specialAllowance: 0,
    professionalTax: 0,
  }));

export const SalaryIncrementAddResponseSchema = z.object({
  message: z.string().optional(), // optional To be removed after testing
});
// .strict(); // To be addd after backend is updated
