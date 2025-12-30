import { z } from 'zod';
import { AssetBaseSchema } from './base-asset.schema';
import { AuditSchema, FilterSchema, uuidField } from '@shared/schemas';

const { createdAt, updatedAt } = AuditSchema.shape;
const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const AssetGetRequestSchema = z
  .object({
    assignedTo: z.string().optional(),
    warrantyStatus: z.string().optional(),
    calibrationStatus: z.string().optional(),
    status: z.string().optional(),
    assetType: z.string().optional(),
    category: z.string().optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict();

export const AssetGetBaseResponseSchema = z
  .object({
    ...AssetBaseSchema.shape,
    assignedTo: uuidField.nullable().optional(),
    assignedToFirstName: z.string().min(1).nullable(),
    assignedToLastName: z.string().min(1).nullable(),
    assignedToEmail: z.string().min(1).nullable(),
    createdAt,
    updatedAt,
  })
  .strict()
  .transform(
    ({
      assignedTo,
      assignedToFirstName,
      assignedToLastName,
      assignedToEmail,
      ...rest
    }) => {
      return {
        ...rest,
        assignedToUser: assignedTo
          ? {
              id: assignedTo,
              firstName: assignedToFirstName,
              lastName: assignedToLastName,
              email: assignedToEmail,
              employeeId: 'assignedToEmployeeId',
            }
          : null,
      };
    }
  );

export const AssetGetStatsResponseSchema = z.object({}).strict();

export const AssetGetResponseSchema = z
  .object({
    records: z.array(AssetGetBaseResponseSchema),
    stats: AssetGetStatsResponseSchema.strict().optional(), // TODO: remove optional chaining from stats
    totalRecords: z.number().int().nonnegative(),
  })
  .strict();
