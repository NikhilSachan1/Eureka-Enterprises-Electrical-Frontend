import { z } from 'zod';
import { AuditSchema } from '@shared/schemas';
import {
  toTitleCase,
  toSentenceCase,
  toLowerCase,
  replaceTextWithSeparator,
} from '@shared/utility';
import { SystemPermissionBaseSchema } from './base-system-permission.schema';

const { name, module, label, description } = SystemPermissionBaseSchema.shape;

export const SystemPermissionGetBaseResponseSchema =
  SystemPermissionBaseSchema.pick({
    name: true,
    module: true,
    label: true,
    description: true,
    isEditable: true,
    isDeletable: true,
  })
    .extend({
      id: z.uuid(),
      name: name.transform(val => toLowerCase(val)),
      module: module.transform(val => {
        const moduleText = replaceTextWithSeparator(val, '_', ' ');
        return toTitleCase(moduleText);
      }),
      label: label.transform(val => {
        const labelText = replaceTextWithSeparator(val, '_', ' ');
        return toTitleCase(labelText);
      }),
      description: description.transform(val => toSentenceCase(val)),
    })
    .merge(
      AuditSchema.pick({
        createdBy: true,
        updatedBy: true,
        deletedBy: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      })
    )
    .strict();

export const SystemPermissionGetResponseSchema = z
  .object({
    records: z.array(SystemPermissionGetBaseResponseSchema),
    totalRecords: z.number().min(0),
  })
  .strict();
