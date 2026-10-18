import { z } from 'zod';

export const UserDelegationWithdrawResponseSchema = z.looseObject({
  message: z.string(),
});
