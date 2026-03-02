import { onlyDateStringField, UserSchema, uuidField } from '@shared/schemas';
import { z } from 'zod';
import { VehicleServiceBaseSchema } from './base-vehicle-service.schema';
import { makeFieldsNullable } from '@shared/utility';

export const VehicleServiceDetailGetRequestSchema = z
  .object({
    vehicleServiceId: uuidField,
  })
  .strict()
  .transform(data => {
    return {
      id: data.vehicleServiceId,
    };
  });

export const VehicleServiceDetailGetResponseSchema =
  VehicleServiceBaseSchema.extend({
    serviceDate: onlyDateStringField,
    serviceFiles: z.array(
      z.object({
        id: uuidField,
        fileKey: z.string(),
        fileType: z.string(),
        label: z.string().nullable(),
      })
    ),
    createdByUser: UserSchema,
    updatedByUser: makeFieldsNullable(UserSchema).nullable(),
  })
    .strict()
    .transform(({ serviceFiles, ...rest }) => ({
      ...rest,
      documentKeys: serviceFiles.map(file => file.fileKey),
    }));
