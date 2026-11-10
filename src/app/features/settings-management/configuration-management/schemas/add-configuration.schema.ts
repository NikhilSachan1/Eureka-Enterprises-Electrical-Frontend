import * as z from 'zod';
import { uuidField } from '@shared/schemas';
import {
  ConfigurationUpsertShapeSchema,
  toEffectiveDateRange,
} from './base-configuration.schema';
import { replaceTextWithSeparator, toLowerCase } from '@shared/utility';

export const ConfigurationAddRequestSchema =
  ConfigurationUpsertShapeSchema.strict().transform(data => {
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
          ...toEffectiveDateRange(data.configEffectiveDate),
          isActive: true,
        },
      ],
    };
  });

/** Backend returns the created configuration entity (no `message`). */
export const ConfigurationAddResponseSchema = z.looseObject({
  id: uuidField,
});
