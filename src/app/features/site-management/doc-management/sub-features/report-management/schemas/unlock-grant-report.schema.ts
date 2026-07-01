import { z } from 'zod';

export const UnlockGrantReportResponseSchema = z.looseObject({
  message: z.string(),
});
