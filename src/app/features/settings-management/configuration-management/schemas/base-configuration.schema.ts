import z from 'zod';
import { onlyDateStringField, uuidField } from '@shared/schemas';

export const ConfigurationBaseSchema = z.object({
  id: uuidField,
  module: z.string(),
  key: z.string(),
  label: z.string(),
  valueType: z.string(),
  isEditable: z.boolean(),
  description: z.string().nullable(),
  configSettings: z.array(
    z.object({
      id: uuidField,
      contextKey: z.string().nullable(),
      value: z.union([z.array(z.any()), z.json(), z.number()]),
      effectiveFrom: onlyDateStringField.nullable(),
      effectiveTo: onlyDateStringField.nullable(),
      isActive: z.boolean(),
    })
  ),
});
