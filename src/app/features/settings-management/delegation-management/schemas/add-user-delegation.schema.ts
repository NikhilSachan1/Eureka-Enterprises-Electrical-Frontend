import { uuidField } from '@shared/schemas';
import { z } from 'zod';

export const UserDelegationAddRequestSchema = z
  .object({
    managerName: uuidField,
    memberName: uuidField,
    module: z.string().trim().min(1),
  })
  .strict()
  .transform(data => ({
    managerId: data.managerName,
    memberId: data.memberName,
    module: data.module,
  }));

export const UserDelegationAddResponseSchema = z.looseObject({
  message: z.string(),
});
