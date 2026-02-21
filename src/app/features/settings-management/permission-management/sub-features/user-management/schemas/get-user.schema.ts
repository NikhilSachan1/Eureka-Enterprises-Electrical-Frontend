import { AuditSchema, FilterSchema, uuidField } from '@shared/schemas';
import { z } from 'zod';

export const { createdAt, updatedAt } = AuditSchema.shape;
const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const UserGetRequestSchema = z
  .object({
    employeeName: z.array(z.string()).optional(),
    roleName: z.array(z.string()).optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict()
  .transform(({ employeeName, roleName, ...rest }) => {
    return {
      ...rest,
      userId: employeeName,
      roleId: roleName,
    };
  });

export const UserGetBaseResponseSchema = z
  .object({
    id: uuidField,
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    employeeId: z.string(),
    status: z.string(),
    role: z.string().nullable(), // TODO: Remove this nullable once the role is added to the user
    rolePermissionsCount: z.number(),
    userPermissionsCount: z.number(),
    totalPermissions: z.number(),
    createdAt,
    updatedAt,
  })
  .strict();

export const UserGetResponseSchema = z
  .object({
    records: z.array(UserGetBaseResponseSchema),
    totalRecords: z.number(),
    systemTotalPermissions: z.number(),
  })
  .strict();
