import { dateField, uuidField } from '@shared/schemas';
import { EButtonActionType } from '@shared/types';
import { transformDateFormat } from '@shared/utility';
import z from 'zod';

export const WorkforceAllocationActionRequestSchema = z
  .object({
    actionType: z.enum([
      EButtonActionType.ALLOCATE,
      EButtonActionType.DEALLOCATE,
      EButtonActionType.TRANSFER,
    ]),
    projectName: uuidField.nullable().optional(),
    allocateDate: dateField.nullable().optional(),
    releaseDate: dateField.nullable().optional(),
    userId: uuidField,
    allocationId: uuidField.nullable().optional(),
  })
  .strict()
  .transform(
    ({
      actionType,
      projectName,
      allocateDate,
      releaseDate,
      userId,
      allocationId,
    }) => {
      if (actionType === EButtonActionType.ALLOCATE) {
        return {
          allocations: [
            {
              siteId: projectName as string,
              userId,
              allocatedAt: transformDateFormat(allocateDate as Date),
            },
          ],
          deallocations: [],
        };
      }

      if (actionType === EButtonActionType.DEALLOCATE) {
        return {
          allocations: [],
          deallocations: [
            {
              allocationId: allocationId as string,
              deallocatedAt: transformDateFormat(releaseDate as Date),
            },
          ],
        };
      }

      return {
        allocations: [
          {
            siteId: projectName as string,
            userId,
            allocatedAt: transformDateFormat(allocateDate as Date),
          },
        ],
        deallocations: [
          {
            allocationId: allocationId as string,
            deallocatedAt: transformDateFormat(releaseDate as Date),
          },
        ],
      };
    }
  );

export const WorkforceAllocationManageResponseSchema = z.looseObject({
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
