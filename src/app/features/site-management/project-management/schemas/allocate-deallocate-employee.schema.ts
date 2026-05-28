import { APP_CONFIG } from '@core/config';
import { onlyDateStringField, uuidField } from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';
import z from 'zod';

export const AllocateDeallocateEmployeeRequestSchema = z
  .object({
    projectName: uuidField,
    allocations: z.array(
      z
        .object({
          userId: uuidField,
          date: onlyDateStringField,
        })
        .strict()
    ),
    deallocations: z.array(
      z
        .object({
          allocationId: uuidField,
          date: onlyDateStringField,
        })
        .strict()
    ),
  })
  .strict()
  .transform(({ projectName, allocations, deallocations }) => ({
    allocations: allocations.map(allocation => ({
      siteId: projectName,
      userId: allocation.userId,
      allocatedAt:
        transformDateFormat(allocation.date, APP_CONFIG.DATE_FORMATS.API) ||
        allocation.date,
    })),
    deallocations: deallocations.map(deallocation => ({
      allocationId: deallocation.allocationId,
      deallocatedAt:
        transformDateFormat(deallocation.date, APP_CONFIG.DATE_FORMATS.API) ||
        deallocation.date,
    })),
  }));

export const AllocateDeallocateEmployeeResponseSchema = z.looseObject({
  message: z.string(),
  allocations: z
    .looseObject({
      totalRequested: z.number().int().nonnegative(),
      successCount: z.number().int().nonnegative(),
      failureCount: z.number().int().nonnegative(),
      results: z.array(
        z.looseObject({
          userId: uuidField.optional(),
          siteId: uuidField.optional(),
          success: z.boolean(),
          message: z.string().optional().nullable(),
        })
      ),
    })
    .optional(),
  deallocations: z
    .looseObject({
      totalRequested: z.number().int().nonnegative(),
      successCount: z.number().int().nonnegative(),
      failureCount: z.number().int().nonnegative(),
      results: z.array(
        z.looseObject({
          allocationId: uuidField.optional(),
          siteId: uuidField.optional(),
          success: z.boolean(),
          message: z.string().optional().nullable(),
        })
      ),
    })
    .optional(),
});
