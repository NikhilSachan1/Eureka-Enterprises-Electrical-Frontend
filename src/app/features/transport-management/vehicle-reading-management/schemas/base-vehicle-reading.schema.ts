import {
  dateField,
  fileField,
  onlyDateStringField,
  uuidField,
} from '@shared/schemas';
import z from 'zod';

export const VehicleReadingBaseSchema = z
  .object({
    id: uuidField,
    vehicleId: uuidField,
    driverId: uuidField,
    siteId: uuidField.nullable(),
    logDate: onlyDateStringField,
    status: z.string(),
    startOdometerReading: z.number().nullable(),
    startTime: z.string().nullable(),
    startLocation: z.string().nullable(),
    endOdometerReading: z.number().nullable(),
    endTime: z.string().nullable(),
    endLocation: z.string().nullable(),
    purpose: z.string().nullable(),
    driverRemarks: z.string(),
    odometerResetFlag: z.boolean(),
  })
  .strict();

export const VehicleReadingUpsertShapeSchema = z
  .object({
    vehicleName: uuidField,
    readingDate: dateField,
    startOdometerReading: z.number(),
    startTime: dateField.nullable(),
    startLocation: z.string().nullable(),
    endOdometerReading: z.number(),
    endTime: dateField.nullable(),
    endLocation: z.string().nullable(),
    remarks: z.string(),
    startOdometerReadingAttachments: z.array(fileField),
    endOdometerReadingAttachments: z.array(fileField),
  })
  .strict();
