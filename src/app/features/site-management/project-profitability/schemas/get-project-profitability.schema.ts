import { uuidField } from '@shared/schemas';
import { z } from 'zod';

export const ProjectProfitabilityGetRequestSchema = z
  .object({
    projectName: uuidField,
  })
  .strict()
  .transform(({ projectName }) => {
    return {
      siteId: projectName,
    };
  });

export const ProjectProfitabilityGetResponseSchema = z.looseObject({
  revenue: z.looseObject({
    totalPOValue: z.number(),
    totalInvoiced: z.number(),
    pendingToInvoice: z.number(),
  }),
  expenses: z.looseObject({
    total: z.number(),
    employeeExpenses: z.number(),
    fuelExpenses: z.number(),
    payrollCosts: z.number(),
  }),
  profitability: z.looseObject({
    grossProfit: z.number(),
    profitMarginPercent: z.number(),
  }),
});
