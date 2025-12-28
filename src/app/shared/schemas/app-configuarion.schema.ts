import z from 'zod';
import { onlyDateStringField, uuidField } from './common.schema';

export const AppConfiguationRequestSchema = z.object({});

const AppConfigurationConfigSettingsSchema = z
  .object({
    id: uuidField,
    contextKey: z.string().nullable(),
    value: z.union([z.array(z.any()), z.json(), z.number()]),
    effectiveFrom: onlyDateStringField.nullable(),
    effectiveTo: onlyDateStringField.nullable(),
    isActive: z.boolean(),
  })
  .strict();

const AppConfigurationRecordSchema = z
  .object({
    id: uuidField,
    module: z.string(),
    key: z.string(),
    label: z.string(),
    valueType: z.enum(['json', 'number', 'array']),
    isEditable: z.boolean(),
    description: z.string().nullable(),
    configSettings: z.array(AppConfigurationConfigSettingsSchema),
  })
  .strict();

export const AppConfiguationResponseSchema = z
  .object({
    records: z.array(AppConfigurationRecordSchema),
    totalRecords: z.number(),
  })
  .strict();
