import z from 'zod';

export const LedgerBalanceDashboardGetResponseSchema = z.looseObject({
  expense: z.looseObject({
    payable: z.looseObject({
      totalAmount: z.number().nonnegative().default(0),
    }),
    overpaid: z.looseObject({
      totalAmount: z.number().nonnegative().default(0),
    }),
  }),
  fuel: z.looseObject({
    payable: z.looseObject({
      totalAmount: z.number().nonnegative().default(0),
    }),
    overpaid: z.looseObject({
      totalAmount: z.number().nonnegative().default(0),
    }),
  }),
});
