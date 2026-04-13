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
        includeVehicle: true,
        includeDriver: true,
        includeSite: true,
        includeFiles: true,
      };
    }
  );

export const VehicleReadingGetBaseResponseSchema =
  VehicleReadingBaseSchema.extend({
    ...AuditSchema.shape,
    totalKmTraveled: z.number().nullable(),
    anomalyDetected: z.boolean(),
    anomalyReason: z.string().nullable(),
    vehicle: VehicleBaseSchema.pick({
      id: true,
      registrationNo: true,
      // brand: true, // TODO: Add brand
      // model: true, // TODO: Add model
      // mileage: true, // TODO: Add mileage
      // fuelType: true, // TODO: Add fuel type
    })
      .loose()
      .transform(({ ...rest }) => ({
        // ToDo: Remove this once we have the brand, model, mileage and fuel type
        ...rest,
        brand: `brand`,
        model: `model`,
        mileage: 'mileage',
        fuelType: 'fuel type',
      })),
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

export const VehicleReadingGetResponseSchema = z
  .looseObject({
    records: z.array(VehicleReadingGetBaseResponseSchema),
    totalRecords: z.number().int().nonnegative(),
  })
  .loose();
