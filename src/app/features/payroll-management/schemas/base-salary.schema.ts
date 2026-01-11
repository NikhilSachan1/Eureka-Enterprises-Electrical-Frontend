import { z } from 'zod';

export const SalaryBaseSchema = z
  .object({
    basicSalary: z.string(),
    hra: z.string(),
    tds: z.string(),
    employerEsicContribution: z.string(),
    employeePfContribution: z.string(),
    foodAllowance: z.string(),
  })
  .strict();
