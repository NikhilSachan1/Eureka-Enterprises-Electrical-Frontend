import * as z from 'zod';

export const AttendanceDeleteResponseSchema = z.looseObject({
  message: z.string(),
});
