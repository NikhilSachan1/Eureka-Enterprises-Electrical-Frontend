import * as z from 'zod';
import { dateField, onlyDateStringField, uuidField } from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';

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

/** Date range picker value: empty/null when not set, second date may be null mid-selection. */
// Keep these required-but-nullable (not optional): optional keys make the
// form's fieldConfigs entries `| undefined`, which breaks the templates.
const effectiveDateRangeField = z.array(dateField.nullable()).nullable();

export const ConfigSettingUpsertShapeSchema = z.object({
  configContextKey: z.string().nullable(),
  configValue: z.unknown(),
  configEffectiveDate: effectiveDateRangeField,
});

export const ConfigurationUpsertShapeSchema = z.object({
  moduleName: z.string(),
  configurationName: z.string(),
  configurationType: z.string(),
  description: z.string().nullable(),
  ...ConfigSettingUpsertShapeSchema.shape,
});

/**
 * Converts the range picker value into the API's `effectiveFrom/effectiveTo`
 * (YYYY-MM-DD). A single picked date is treated as a one-day range.
 */
export function toEffectiveDateRange(
  range: (Date | null)[] | null | undefined
): { effectiveFrom: string | null; effectiveTo: string | null } {
  const [from, to] = range ?? [];
  if (!from) {
    return { effectiveFrom: null, effectiveTo: null };
  }
  return {
    effectiveFrom: transformDateFormat(from),
    effectiveTo: transformDateFormat(to ?? from),
  };
}
