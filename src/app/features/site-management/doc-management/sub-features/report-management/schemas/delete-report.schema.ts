import { z } from 'zod';

export const DeleteReportResponseSchema = z.looseObject({
  message: z.string(),
});
