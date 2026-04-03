import {
  AuditSchema,
  dateField,
  FilterSchema,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import { z } from 'zod';
import { VehicleDetailGetBaseResponseSchema } from './get-vehicle-detail.schema';
import { makeFieldsNullable, transformDateFormat } from '@shared/utility';
import { VehicleBaseDocumentsSchema } from './base-vehicle.schema';

const { createdAt, updatedAt, createdBy } = AuditSchema.shape;
const { id, registrationNo, model, brand, status } =
  VehicleDetailGetBaseResponseSchema.shape;

export const VehicleEventHistoryGetRequestSchema = z
  .object({
    ...FilterSchema.shape,
    vehicleName: z.string().optional(),
    vehicleEventTypes: z.array(z.string()).min(1).optional(),
    vehicleFromEmployeeName: z.string().optional(),
    vehicleToEmployeeName: z.string().optional(),
    vehicleEventDate: z.array(dateField).min(1).optional(),
  })
  .strict()
  .transform(
    ({
      vehicleName: _vehicleName,
      vehicleEventDate: dateRange,
      vehicleFromEmployeeName,
      vehicleToEmployeeName,
      vehicleEventTypes,
      ...rest
    }) => {
      const [start, end] = dateRange ?? [];
      return {
        ...rest,
        fromUser: vehicleFromEmployeeName,
        toUser: vehicleToEmployeeName,
        eventTypes: vehicleEventTypes,
        startDate: transformDateFormat(start),
        endDate: transformDateFormat(end),
      };
    }
  );

export const VehicleEventHistoryGetStatsResponseSchema = z
  .object({
    total: z.number().int().nonnegative(),
    byEventType: z.object({
      VEHICLE_ADDED: z.number().int().nonnegative(),
      AVAILABLE: z.number().int().nonnegative(),
      ASSIGNED: z.number().int().nonnegative(),
      DEALLOCATED: z.number().int().nonnegative(),
      UNDER_MAINTENANCE: z.number().int().nonnegative(),
      DAMAGED: z.number().int().nonnegative(),
      RETIRED: z.number().int().nonnegative(),
      UPDATED: z.number().int().nonnegative(),
      HANDOVER_INITIATED: z.number().int().nonnegative(),
      HANDOVER_ACCEPTED: z.number().int().nonnegative(),
      HANDOVER_REJECTED: z.number().int().nonnegative(),
      HANDOVER_CANCELLED: z.number().int().nonnegative(),
    }),
  })
  .strict();

export const VehicleEventHistoryGetBaseResponseObjectSchema = z
  .object({
    id: uuidField,
    vehicleMasterId: uuidField,
    eventType: z.string().min(1),
    fromUserId: uuidField.nullable(),
    toUserId: uuidField.nullable(),
    createdAt,
    updatedAt,
    createdById: createdBy,
    createdByUser: UserSchema,
    fromUserDetails: makeFieldsNullable(UserSchema).nullable(),
    toUserDetails: makeFieldsNullable(UserSchema).nullable(),
    metadata: z.record(z.string(), z.string()).nullable(),
    vehicleFiles: z.array(makeFieldsNullable(VehicleBaseDocumentsSchema)),
    vehicle: z
      .object({
        id,
        registrationNo,
        model,
        brand,
        status,
      })
      .loose(),
  })
  .loose();

export const VehicleEventHistoryGetBaseResponseSchema =
  VehicleEventHistoryGetBaseResponseObjectSchema.transform(
    ({ vehicleFiles, ...rest }) => ({
      ...rest,
      documentKeys: vehicleFiles.map(file => file.fileKey),
    })
  );

export const VehicleEventHistoryGetResponseSchema = z
  .object({
    records: z.array(VehicleEventHistoryGetBaseResponseSchema),
    stats: VehicleEventHistoryGetStatsResponseSchema.strict(),
    totalRecords: z.number().int().nonnegative(),
  })
  .strict();
