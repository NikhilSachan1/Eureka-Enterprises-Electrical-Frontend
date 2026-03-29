import { z } from 'zod';
import { ConfigurationBaseSchema } from './base-configuration.schema';

const { id } = ConfigurationBaseSchema.shape;

export const ConfigurationDetailGetRequestSchema = z
  .object({
    configurationId: id,
  })
  .strict()
  .transform(data => {
    return {
      id: data.configurationId,
    };
  });

export const ConfigurationDetailGetResponseSchema = ConfigurationBaseSchema;
