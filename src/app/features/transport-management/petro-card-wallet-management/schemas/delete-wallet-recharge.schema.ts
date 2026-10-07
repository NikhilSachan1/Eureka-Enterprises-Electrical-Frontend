import { uuidField } from '@shared/schemas';
import z from 'zod';

export const WalletRechargeDeleteResponseSchema = z.looseObject({
  message: z.string(),
  id: uuidField,
  balance: z.coerce.number(),
});
