import z from 'zod';

export const WalletBalanceResponseSchema = z.looseObject({
  balance: z.coerce.number(),
  totalRecharged: z.coerce.number(),
  totalConsumed: z.coerce.number(),
  pendingConsumed: z.coerce.number(),
  approvedConsumed: z.coerce.number(),
});
