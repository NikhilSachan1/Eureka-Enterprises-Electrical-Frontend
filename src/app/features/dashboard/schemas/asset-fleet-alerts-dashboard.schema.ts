import z from 'zod';

const ExpiryCountSchema = z.looseObject({
  expired: z.number().int().nonnegative().default(0),
  expiringSoon: z.number().int().nonnegative().default(0),
});

const DueCountSchema = z.looseObject({
  dueSoon: z.number().int().nonnegative().default(0),
  overdue: z.number().int().nonnegative().default(0),
});

const AssetFleetAlertItemSchema = z.looseObject({
  type: z.string(),
  severity: z.string(),
  data: z
    .looseObject({
      documentType: z.string().optional(),
      severity: z.string().optional(),
      assetName: z.string().optional(),
      assetCode: z.string().optional(),
      vehicleNumber: z.string().optional(),
    })
    .default({}),
});

export const AssetFleetAlertsDashboardGetResponseSchema = z
  .looseObject({
    critical: z.array(AssetFleetAlertItemSchema).default([]),
    warning: z.array(AssetFleetAlertItemSchema).default([]),
    info: z.array(AssetFleetAlertItemSchema).default([]),
    counts: z.looseObject({
      assetCalibration: DueCountSchema,
      assetWarranty: ExpiryCountSchema,
      vehicleDocExpiry: ExpiryCountSchema,
      vehicleServiceDue: DueCountSchema,
    }),
  })
  .transform(response => {
    const puc = { expired: 0, expiringSoon: 0 };
    const insurance = { expired: 0, expiringSoon: 0 };

    for (const item of [
      ...response.critical,
      ...response.warning,
      ...response.info,
    ]) {
      if (item.type !== 'vehicleDocExpiry') {
        continue;
      }

      const documentType = item.data.documentType?.trim().toLowerCase();
      const isExpired =
        item.severity.trim().toLowerCase() === 'critical' ||
        item.data.severity?.trim().toLowerCase() === 'expired';
      const bucket = isExpired ? 'expired' : 'expiringSoon';

      if (documentType === 'puc') {
        puc[bucket] += 1;
      } else if (documentType === 'insurance') {
        insurance[bucket] += 1;
      }
    }

    return {
      ...response,
      counts: {
        ...response.counts,
        vehiclePucExpiry: puc,
        vehicleInsuranceExpiry: insurance,
      },
    };
  });
