import * as z from 'zod';
import { uuidField } from '@shared/schemas';
import {
  ConfigSettingUpsertShapeSchema,
  ConfigurationUpsertShapeSchema,
  toEffectiveDateRange,
} from './base-configuration.schema';

/**
 * PATCH /configurations/:id — metadata only. The backend rejects unknown
 * properties (forbidNonWhitelisted) and setting fields live on a separate
 * endpoint, so only module/label/valueType/description are sent. The key is
 * intentionally left unchanged: other modules look configurations up by key.
 */
export const ConfigurationEditRequestSchema =
  ConfigurationUpsertShapeSchema.pick({
    moduleName: true,
    configurationName: true,
    configurationType: true,
    description: true,
  })
    .strict()
    .transform(data => ({
      module: data.moduleName,
      label: data.configurationName,
      valueType: data.configurationType,
      description: data.description ?? '',
    }));

export const ConfigurationEditResponseSchema = z.looseObject({
  id: uuidField,
});

/** PATCH /config-settings/:id */
export const ConfigSettingEditRequestSchema =
  ConfigSettingUpsertShapeSchema.strict().transform(data => ({
    contextKey: data.configContextKey?.trim() ? data.configContextKey : null,
    value: data.configValue,
    ...toEffectiveDateRange(data.configEffectiveDate),
  }));

/** POST /config-settings — used when a configuration has no setting yet. */
export const ConfigSettingAddRequestSchema =
  ConfigSettingUpsertShapeSchema.extend({
    configurationId: uuidField,
  })
    .strict()
    .transform(data => ({
      configId: data.configurationId,
      contextKey: data.configContextKey?.trim() ? data.configContextKey : null,
      value: data.configValue,
      ...toEffectiveDateRange(data.configEffectiveDate),
      isActive: true,
    }));

export const ConfigSettingUpsertResponseSchema = z.looseObject({
  id: uuidField,
});
