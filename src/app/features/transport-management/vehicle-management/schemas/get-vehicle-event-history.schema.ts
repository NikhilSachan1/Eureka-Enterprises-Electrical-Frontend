import {
  AuditSchema,
  dateField,
  FilterSchema,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import { z } from 'zod';
import { VehicleDetailGetBaseResponseSchema } from './get-vehicle-detail.schema';
import { makeFieldsNullable } from '@shared/utility';
import { VehicleBaseDocumentsSchema } from './base-vehicle.schema';

const { createdAt, updatedAt, createdBy } = AuditSchema.shape;
const { id, registrationNo, model, brand, status } =
  VehicleDetailGetBaseResponseSchema.shape;

export const VehicleEventHistoryGetRequestSchema = z
  .object({
    ...FilterSchema.shape,
    eventTypes: z.array(z.string()).min(1).optional(),
    fromUser: z.string().optional(),
    toUser: z.string().optional(),
    eventDate: z.array(dateField).min(1).optional(),
  })
  .strict()
  .transform(({ eventDate: dateRange, ...rest }) => {
    if (!dateRange || dateRange.length < 1) {
      return rest;
    }

    const start = dateRange[0];
    const end = dateRange[dateRange.length - 1];

    const toISODate = (d: Date): string =>
      new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
        .toISOString()
        .split('T')[0];

    return {
      ...rest,
      startDate: toISODate(start),
      endDate: toISODate(end),
    };
  });

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

export const VehicleEventHistoryGetBaseResponseSchema = z
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
      .strict(),
  })
  .strict()
  .transform(({ vehicleFiles, ...rest }) => ({
    ...rest,
    documentKeys: vehicleFiles.map(file => file.fileKey),
  }));

export const VehicleEventHistoryGetResponseSchema = z
  .object({
    records: z.array(VehicleEventHistoryGetBaseResponseSchema),
    stats: VehicleEventHistoryGetStatsResponseSchema.strict(),
    totalRecords: z.number().int().nonnegative(),
  })
  .strict();
