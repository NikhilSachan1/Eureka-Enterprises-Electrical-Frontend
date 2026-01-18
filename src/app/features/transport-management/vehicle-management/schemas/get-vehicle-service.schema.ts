import { z } from 'zod';
import { dateField, FilterSchema, uuidField } from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';

export const VehicleServiceGetRequestSchema = z
  .object({
    vehicleId: uuidField,
    serviceType: z.string().optional(),
    serviceStatus: z.string().optional(),
    serviceDate: z.array(dateField).optional(),
    ...FilterSchema.shape,
  })
  .strict()
  .transform(({ vehicleId, serviceDate, ...rest }) => {
    const [start, end] = serviceDate ?? [];
    return {
      ...rest,
      vehicleMasterId: vehicleId,
      serviceDateFrom: transformDateFormat(start),
      serviceDateTo: transformDateFormat(end),
    };
  });

export const VehicleServiceGetBaseResponseSchema = z.object({}).strict();
// .transform(({ files, ...rest }) => ({
//     ...rest,
//     documentKeys: files.map(file => file.fileKey),
// }));

export const VehicleServiceGetStatsResponseSchema = z
  .object({
    total: z.number().int().nonnegative(),
  })
  .strict();

export const VehicleServiceGetResponseSchema = z
  .object({
    records: z.array(VehicleServiceGetBaseResponseSchema),
    stats: VehicleServiceGetStatsResponseSchema.strict(),
    totalRecords: z.number().int().nonnegative(),
  })
  .strict();
