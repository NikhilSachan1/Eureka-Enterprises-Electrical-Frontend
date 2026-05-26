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
});
