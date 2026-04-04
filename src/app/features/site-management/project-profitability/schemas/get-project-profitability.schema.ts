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
    totalInvoicesRaised: z.number().optional(),
  }),
  expenses: z.looseObject({
    total: z.number(),
    employeeExpenses: z.number(),
    fuelExpenses: z.number(),
    payrollCosts: z.number(),
    categorizedBreakdown: z
      .array(
        z.looseObject({
          label: z.string().optional(),
          amount: z.number(),
          percentOfTotal: z.number().optional(),
        })
      )
      .optional(),
  }),
  profitability: z.looseObject({
    grossProfit: z.number(),
    profitMarginPercent: z.number(),
  }),
});
