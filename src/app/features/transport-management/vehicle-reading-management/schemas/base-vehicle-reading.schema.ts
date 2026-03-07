import { dateField, fileField, uuidField } from '@shared/schemas';
import z from 'zod';

export const VehicleReadingBaseSchema = z
  .object({
    id: uuidField,
  })
  .strict();

export const VehicleReadingUpsertShapeSchema = z
  .object({
    vehicleName: uuidField,
    readingDate: dateField,
    startOdometerReading: z.number(),
    startTime: dateField,
    startLocation: z.string().nullable(),
    endOdometerReading: z.number(),
    endTime: dateField,
    endLocation: z.string().nullable(),
    remarks: z.string(),
    startOdometerReadingAttachments: z.array(fileField),
    endOdometerReadingAttachments: z.array(fileField),
  })
  .strict();
