import { z } from 'zod';
import { ConfigurationUpsertShapeSchema } from './base-configuration.schema';

export const ConfigurationAddRequestSchema =
  ConfigurationUpsertShapeSchema.strict().transform(data => {
    return {
      module: data.moduleName,
      configurationName: data.configurationName,
      configurationType: data.configurationType,
      description: data.description,
      configContextKey: data.configContextKey,
      configValue: data.configValue,
      configEffectiveDate: data.configEffectiveDate,
    };
  });

export const ConfigurationAddResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
