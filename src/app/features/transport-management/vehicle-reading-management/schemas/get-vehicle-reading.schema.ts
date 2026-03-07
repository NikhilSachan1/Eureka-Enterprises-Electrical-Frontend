import { z } from 'zod';
import { dateField, FilterSchema, uuidField } from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const VehicleReadingGetRequestSchema = z
  .object({
    vehicleName: uuidField.optional(),
    employeeName: uuidField.optional(),
    projectName: uuidField.optional(),
    readingDate: z.array(dateField).min(1).optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict()
  .transform(
    ({ vehicleName, employeeName, projectName, readingDate, ...rest }) => {
      const [start, end] = readingDate ?? [];
      return {
        ...rest,
        vehicleId: vehicleName,
        driverId: employeeName,
        siteId: projectName,
        fromDate: transformDateFormat(start),
        toDate: transformDateFormat(end),
        anomalyDetected: true,
        includeVehicle: true,
        includeDriver: true,
        includeSite: true,
        includeFiles: true,
      };
    }
  );

export const VehicleReadingGetBaseResponseSchema = z
  .object({
    id: uuidField,
  })
  .strict();

export const VehicleReadingGetResponseSchema = z
  .object({
    records: z.array(VehicleReadingGetBaseResponseSchema),
    totalRecords: z.number().int().nonnegative(),
  })
  .strict();
