import { z } from 'zod';
import { AuditSchema, FilterSchema } from '@shared/schemas';
import { PetroCardBaseSchema } from './base-petro-card.schema';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const PetroCardGetRequestSchema = z
  .object({
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict();

export const PetroCardGetBaseResponseSchema = z
  .object({
    ...PetroCardBaseSchema.shape,
    ...AuditSchema.shape,
  })
  .strict();

export const PetroCardGetStatsResponseSchema = z
  .object({
    total: z.number().int().nonnegative(),
  })
  .strict();

export const PetroCardGetResponseSchema = z
  .object({
    records: z.array(PetroCardGetBaseResponseSchema),
    stats: PetroCardGetStatsResponseSchema.strict(),
    totalRecords: z.number().int().nonnegative(),
  })
  .strict();
