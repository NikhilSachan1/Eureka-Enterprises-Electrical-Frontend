import { z } from 'zod';
import { toLowerCase, toSentenceCase, toTitleCase } from '@shared/utility';
import { AuditSchema } from '@app/shared/schemas';
import { RoleBaseSchema } from './base-role.schema';

const { name, label, description } = RoleBaseSchema.shape;

export const RoleGetBaseResponseSchema = RoleBaseSchema.pick({
  name: true,
  label: true,
  description: true,
  isEditable: true,
  isDeletable: true,
  permissionCount: true,
})
  .extend({
    id: z.string().uuid(),
    name: name.transform(val => toLowerCase(val)),
    label: label.transform(val => toTitleCase(val)),
    description: description.transform(val => toSentenceCase(val)),
  })
  .merge(
    AuditSchema.pick({
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    })
  )
  .strict();

export const RoleGetResponseSchema = z
  .object({
    records: z.array(RoleGetBaseResponseSchema),
    totalRecords: z.number(),
    totalPermissions: z.number(),
  })
  .strict();
