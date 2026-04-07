import { z } from 'zod';
import { dateField, uuidField } from '@shared/schemas';
import { ESalaryIncrementType } from '../types/payroll.enum';
import { transformDateFormat } from '@shared/utility';
import { SalaryBaseSchema } from './base-salary.schema';

export const SalaryIncrementAddRequestSchema = z
  .object({
    employeeName: uuidField,
    ...SalaryBaseSchema.shape,
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
  }));

export const SalaryIncrementAddResponseSchema = z.looseObject({
  message: z.string().optional(),
});
