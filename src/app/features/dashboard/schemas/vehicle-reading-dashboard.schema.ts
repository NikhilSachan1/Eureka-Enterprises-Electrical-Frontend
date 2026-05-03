import z from 'zod';

export const VehicleReadingsAlertsDashboardGetResponseSchema = z.looseObject({
  noReading2Days: z.looseObject({
    count: z.number().int().nonnegative().default(0),
  }),
});
