import z from 'zod';

export const AssetFleetAlertsDashboardGetResponseSchema = z.looseObject({
  counts: z.looseObject({
    assetCalibration: z.looseObject({
      dueSoon: z.number().int().nonnegative().default(0),
      overdue: z.number().int().nonnegative().default(0),
    }),
    assetWarranty: z.looseObject({
      expired: z.number().int().nonnegative().default(0),
      expiringSoon: z.number().int().nonnegative().default(0),
    }),
    vehiclePucExpiry: z.looseObject({
      expired: z.number().int().nonnegative().default(0),
      expiringSoon: z.number().int().nonnegative().default(0),
    }),
    vehicleInsuranceExpiry: z.looseObject({
      expired: z.number().int().nonnegative().default(0),
      expiringSoon: z.number().int().nonnegative().default(0),
    }),
    vehicleServiceDue: z.looseObject({
      dueSoon: z.number().int().nonnegative().default(0),
      overdue: z.number().int().nonnegative().default(0),
    }),
  }),
});
