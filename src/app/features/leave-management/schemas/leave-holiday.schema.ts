import * as z from 'zod';

export const LeaveHolidaysGetRequestSchema = z
  .object({ financialYear: z.string().optional() })
  .strict();

export const LeaveHolidaysGetResponseSchema = z.looseObject({
  financialYear: z.string(),
  holidays: z.array(
    z.looseObject({
      date: z.string(),
      name: z.string(),
    })
  ),
});
