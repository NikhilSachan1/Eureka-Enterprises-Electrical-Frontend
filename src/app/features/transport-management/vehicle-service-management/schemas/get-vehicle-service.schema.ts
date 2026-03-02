import { z } from 'zod';
import {
  AuditSchema,
  dateField,
  FilterSchema,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';
import { VehicleBaseSchema } from '../../vehicle-management/schemas/base-vehicle.schema';
import { VehicleServiceBaseSchema } from './base-vehicle-service.schema';

export const { createdAt, updatedAt } = AuditSchema.shape;
export const VehicleServiceGetRequestSchema = z
  .object({
    vehicleName: uuidField.optional(),
    serviceType: z.string().optional(),
    serviceStatus: z.string().optional(),
    serviceDate: z.array(dateField).optional(),
    ...FilterSchema.shape,
  })
  .strict()
  .transform(({ serviceDate, vehicleName, ...rest }) => {
    const [start, end] = serviceDate ?? [];
    return {
      ...rest,
      vehicleMasterId: vehicleName,
      serviceDateFrom: transformDateFormat(start),
      serviceDateTo: transformDateFormat(end),
    };
  });

export const VehicleServiceGetBaseResponseSchema =
  VehicleServiceBaseSchema.extend({
    serviceFiles: z.array(
      z.object({
        id: uuidField,
        fileKey: z.string(),
        fileType: z.string(),
        label: z.string().nullable(),
      })
    ),
    vehicle: VehicleBaseSchema.pick({
      id: true,
      registrationNo: true,
      model: true,
      brand: true,
      status: true,
      fuelType: true,
    }),
    createdByUser: UserSchema,
    // updatedByUser: makeFieldsNullable(UserSchema).nullable(),
  })
    .strict()
    .transform(({ serviceFiles, ...rest }) => ({
      ...rest,
      documentKeys: serviceFiles.map(file => file.fileKey),
    }));

export const VehicleServiceGetStatsResponseSchema = z
  .object({
    totalServices: z.number().int().nonnegative(),
    totalCost: z.number().nonnegative(),
    averageCost: z.number().nonnegative(),
    byStatus: z.object({
      pending: z.number().int().nonnegative(),
      completed: z.number().int().nonnegative(),
      cancelled: z.number().int().nonnegative(),
    }),
    byServiceType: z.object({
      REGULAR_SERVICE: z.number().int().nonnegative(),
      EMERGENCY_SERVICE: z.number().int().nonnegative(),
      BREAKDOWN_REPAIR: z.number().int().nonnegative(),
      ACCIDENT_REPAIR: z.number().int().nonnegative(),
      TYRE_CHANGE: z.number().int().nonnegative(),
      BATTERY_REPLACEMENT: z.number().int().nonnegative(),
      OTHER: z.number().int().nonnegative(),
    }),
  })
  .strict();

export const VehicleServiceGetResponseSchema = z
  .object({
    records: z.array(VehicleServiceGetBaseResponseSchema),
    stats: VehicleServiceGetStatsResponseSchema.strict(),
    totalRecords: z.number().int().nonnegative(),
  })
  .strict();
