import * as z from 'zod';

/** Response of both `PATCH bank-transfers/:id/lock` and `.../unlock`. */
export const LockBankTransferResponseSchema = z.looseObject({
  message: z.string(),
});
