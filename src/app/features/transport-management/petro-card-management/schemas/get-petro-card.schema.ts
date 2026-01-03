import { z } from 'zod';
import {
  AuditSchema,
  FilterSchema,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import { PetroCardBaseSchema } from './base-petro-card.schema';
import { makeFieldsNullable } from '@shared/utility';
import { EPetroCardStatus } from '../types/petro-card.enum';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const PetroCardGetRequestSchema = z
  .object({
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
    cardStatus: z.string().min(1).optional(),
  })
  .strict()
  .transform(({ cardStatus, ...rest }) => {
    return {
      ...rest,
      ...(cardStatus !== undefined && {
        isAllocated: cardStatus === EPetroCardStatus.ALLOCATED.toLowerCase(),
      }),
    };
  });

const VehicleSchema = z.object({
  id: uuidField,
  name: z.string().min(1),
  number: z.string().min(1),
});

export const PetroCardGetBaseResponseSchema = z
  .object({
    ...PetroCardBaseSchema.shape,
    ...AuditSchema.shape,
    isAllocated: z.boolean(),
    allocatedVehicle: makeFieldsNullable(VehicleSchema).nullable(),
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
