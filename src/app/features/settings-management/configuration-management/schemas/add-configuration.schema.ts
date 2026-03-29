import { z } from 'zod';
import { ConfigurationUpsertShapeSchema } from './base-configuration.schema';
import {
  replaceTextWithSeparator,
  transformDateFormat,
  toLowerCase,
} from '@shared/utility';

export const ConfigurationAddRequestSchema =
  ConfigurationUpsertShapeSchema.strict().transform(data => {
    const [fromDate, toDate] = data.configEffectiveDate;
    return {
      module: data.moduleName,
      label: data.configurationName,
      key: toLowerCase(
        replaceTextWithSeparator(data.configurationName, ' ', '_')
      ),
      valueType: data.configurationType,
      isEditable: true,
      description: data.description,
      configSettings: [
        {
          contextKey: data.configContextKey,
          value: data.configValue,
          effectiveFrom: transformDateFormat(fromDate),
          effectiveTo: transformDateFormat(toDate),
          isActive: true,
        },
      ],
    };
  });

export const ConfigurationAddResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
