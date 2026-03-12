import { UserSchema, uuidField } from '@shared/schemas';
import { z } from 'zod';
import { VehicleReadingGetBaseObjectSchema } from './get-vehicle-reading.schema';
import { makeFieldsNullable } from '@shared/utility';

export const VehicleReadingDetailGetRequestSchema = z
  .object({
    vehicleReadingId: uuidField,
  })
  .strict()
  .transform(data => {
    return {
      id: data.vehicleReadingId,
    };
  });

export const VehicleReadingDetailGetResponseSchema =
  VehicleReadingGetBaseObjectSchema.extend({
    createdByUser: UserSchema,
    updatedByUser: makeFieldsNullable(UserSchema).nullable(),
  })
    .loose()
    .transform(({ files, ...rest }) => {
      const startOdometerFiles = files.filter(
        file => file.fileType === 'START_ODOMETER'
      );
      const endOdometerFiles = files.filter(
        file => file.fileType === 'END_ODOMETER'
      );

      return {
        ...rest,
        startOdometerReadingKeys: startOdometerFiles.map(file => file.fileKey),
        endOdometerReadingKeys: endOdometerFiles.map(file => file.fileKey),
        documentKeys: files.map(file => file.fileKey),
      };
    });
