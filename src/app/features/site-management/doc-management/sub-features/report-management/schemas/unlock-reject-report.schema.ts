import * as z from 'zod';

export const UnlockRejectReportResponseSchema = z.looseObject({
  message: z.string(),
});
