import { z } from 'zod';

export const DeleteBankTransferResponseSchema = z.looseObject({
  message: z.string(),
});
