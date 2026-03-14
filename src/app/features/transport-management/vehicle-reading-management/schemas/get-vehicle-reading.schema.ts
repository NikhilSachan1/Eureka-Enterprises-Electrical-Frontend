import { z } from 'zod';
import {
  AuditSchema,
  dateField,
  FilterSchema,
  uuidField,
} from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';
import { VehicleBaseSchema } from '@features/transport-management/vehicle-management/schemas/base-vehicle.schema';
import { EmployeeBaseSchema } from '@features/employee-management/schemas/base-employee.schema';
import { ProjectGetBaseResponseSchema } from '@features/site-management/project-management/schemas';
import { VehicleReadingBaseSchema } from './base-vehicle-reading.schema';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const VehicleReadingGetRequestSchema = z
  .object({
    vehicleName: uuidField.optional(),
    employeeName: z.array(uuidField).optional(),
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
        includeVehicle: true,
        includeDriver: true,
        includeSite: true,
        includeFiles: true,
      };
    }
  );

const VehicleReadingGetBaseObjectSchema = VehicleReadingBaseSchema.extend({
  ...AuditSchema.shape,
  siteId: uuidField.nullable(),
  totalKmTraveled: z.number(),
  anomalyDetected: z.boolean(),
  anomalyReason: z.string().nullable(),
  vehicle: VehicleBaseSchema.pick({
    id: true,
    registrationNo: true,
    brand: true,
    model: true,
    mileage: true,
    fuelType: true,
  }).loose(),
  driver: EmployeeBaseSchema.pick({
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    contactNumber: true,
    employeeId: true,
  }).loose(),
  site: ProjectGetBaseResponseSchema.pick({
    id: true,
    name: true,
    city: true,
    state: true,
  })
    .loose()
    .nullable(),
  files: z.array(
    z.looseObject({
      id: z.string(),
      vehicleLogId: uuidField,
      fileKey: z.string(),
      fileType: z.string(),
      fileName: z.string().nullable(),
    })
  ),
}).loose();

export { VehicleReadingGetBaseObjectSchema };

export const VehicleReadingGetBaseResponseSchema =
  VehicleReadingGetBaseObjectSchema.transform(({ files, ...rest }) => {
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

export const VehicleReadingGetResponseSchema = z
  .looseObject({
    records: z.array(VehicleReadingGetBaseResponseSchema),
    totalRecords: z.number().int().nonnegative(),
  })
  .loose();
