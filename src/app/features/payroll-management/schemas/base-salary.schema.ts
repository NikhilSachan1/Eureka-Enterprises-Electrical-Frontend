import { z } from 'zod';

export const SalaryBaseSchema = z.looseObject({
  basicSalary: z.number(),
  hra: z.number(),
  tds: z.number(),
  employerEsicContribution: z.number(),
  employeePfContribution: z.number(),
  foodAllowance: z.number(),
});
