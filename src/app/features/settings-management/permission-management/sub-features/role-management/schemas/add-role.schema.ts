import { replaceTextWithSeparator, toLowerCase } from '@shared/utility';
import { RoleUpsertShapeSchema } from './base-role.schema';
import { z } from 'zod';

export const RoleAddRequestSchema = RoleUpsertShapeSchema.strict().transform(
  data => {
    return {
      name: replaceTextWithSeparator(toLowerCase(data.roleName), ' ', '_'),
      label: toLowerCase(data.roleName),
      description: toLowerCase(data.roleDescription),
      isDeletable: true,
      isEditable: true,
    };
  }
);

export const RoleAddResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
