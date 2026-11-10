import { uuidField } from '@shared/schemas';
import * as z from 'zod';

export const WalletRechargeDeleteResponseSchema = z.looseObject({
  message: z.string(),
  id: uuidField,
  balance: z.coerce.number(),
});
