import z from 'zod';
import { dateField, onlyDateStringField, uuidField } from '@shared/schemas';

export const ConfigurationBaseSchema = z.looseObject({
  id: uuidField,
  module: z.string(),
  key: z.string(),
  label: z.string(),
  valueType: z.string(),
  isEditable: z.boolean(),
  description: z.string().nullable(),
  configSettings: z.array(
    z.looseObject({
      id: uuidField,
      contextKey: z.string().nullable(),
      value: z.unknown(),
      effectiveFrom: onlyDateStringField.nullable(),
      effectiveTo: onlyDateStringField.nullable(),
      isActive: z.boolean(),
    })
  ),
});

export const ConfigurationUpsertShapeSchema = z.object({
  moduleName: z.string(),
  configurationName: z.string(),
  configurationType: z.string(),
  description: z.string().nullable(),
  configContextKey: z.string().nullable(),
  configValue: z.unknown(),
  configEffectiveDate: z.array(dateField),
});
