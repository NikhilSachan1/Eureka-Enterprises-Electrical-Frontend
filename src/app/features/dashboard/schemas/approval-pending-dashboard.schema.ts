import z from 'zod';

export const ApprovalPendingDashboardGetResponseSchema = z.looseObject({
  totals: z.looseObject({
    leave: z.number().int().nonnegative().default(0),
    attendance: z.number().int().nonnegative().default(0),
    expense: z.number().nonnegative().default(0),
    fuelExpense: z.number().nonnegative().default(0),
    siteDocuments: z.number().int().nonnegative().default(0),
  }),
});
