import { z } from 'zod';
import { AuditSchema, FilterSchema, UserSchema } from '@shared/schemas';
import { PetroCardBaseSchema } from './base-petro-card.schema';
import { makeFieldsNullable } from '@shared/utility';
import { EPetroCardStatus } from '../types/petro-card.enum';
import { VehicleBaseSchema } from '@features/transport-management/vehicle-management/schemas/base-vehicle.schema';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const PetroCardGetRequestSchema = z
  .object({
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
    petroCardStatus: z.string().min(1).optional(),
  })
  .strict()
  .transform(({ petroCardStatus, ...rest }) => {
    return {
      ...rest,
      ...(petroCardStatus !== undefined && {
        isAllocated:
          petroCardStatus === EPetroCardStatus.ALLOCATED.toLowerCase(),
      }),
    };
  });

export const PetroCardGetBaseResponseSchema = z
  .object({
    ...PetroCardBaseSchema.shape,
    ...AuditSchema.shape,
    isAllocated: z.boolean(),
    allocatedVehicle: makeFieldsNullable(
      VehicleBaseSchema.pick({ id: true, registrationNo: true })
    ).nullable(),
    createdByUser: UserSchema.omit({
      employeeId: true,
    }),
  })
  .strict();

export const PetroCardGetStatsResponseSchema = z
  .object({
    total: z.number().int().nonnegative(),
    allocated: z.number().int().nonnegative(),
    available: z.number().int().nonnegative(),
    byExpiryStatus: z.object({
      VALID: z.number().int().nonnegative(),
      EXPIRING_SOON: z.number().int().nonnegative(),
      EXPIRED: z.number().int().nonnegative(),
    }),
    byCardType: z.record(z.string(), z.number().int().nonnegative()),
    byCardName: z.record(z.string(), z.number().int().nonnegative()),
  })
  .strict();

export const PetroCardGetResponseSchema = z
  .object({
    records: z.array(PetroCardGetBaseResponseSchema),
    stats: PetroCardGetStatsResponseSchema.strict(),
    totalRecords: z.number().int().nonnegative(),
  })
  .strict();
