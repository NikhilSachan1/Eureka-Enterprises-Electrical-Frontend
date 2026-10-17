import { FilterSchema, isoDateTimeField, uuidField } from '@shared/schemas';
import { z } from 'zod';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const UserDelegationGetRequestSchema = z
  .object({
    module: z.string().trim().nullable().optional(),
    managerName: uuidField.nullable().optional(),
    memberName: uuidField.nullable().optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict()
  .transform(({ module, managerName, memberName }) => ({
    ...(module ? { module } : {}),
    ...(managerName ? { managerId: managerName } : {}),
    ...(memberName ? { memberId: memberName } : {}),
  }));

export const UserDelegationGetBaseResponseSchema = z.looseObject({
  id: uuidField,
  module: z.string(),
  createdAt: isoDateTimeField,
  managerName: z.string(),
  managerEmployeeId: z.string(),
  memberName: z.string(),
  memberEmployeeId: z.string(),
  grantedBy: z.string(),
  isActive: z.boolean(),
});

export const UserDelegationGetResponseSchema = z.looseObject({
  records: z.array(UserDelegationGetBaseResponseSchema),
  totalRecords: z.number().int().nonnegative(),
});
