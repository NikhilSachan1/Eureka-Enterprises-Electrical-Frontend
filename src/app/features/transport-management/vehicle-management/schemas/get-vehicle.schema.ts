import { z } from 'zod';
import {
  VehicleBaseDocumentsSchema,
  VehicleBaseSchema,
} from './base-vehicle.schema';
import {
  AuditSchema,
  FilterSchema,
  isoDateTimeField,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import { makeFieldsNullable } from '@shared/utility';

const { createdAt, updatedAt, deletedAt } = AuditSchema.shape;
const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const VehicleGetRequestSchema = z
  .object({
    vehicleStatus: z.array(z.string()).optional(),
    vehicleAssignee: z.string().optional(),
    vehicleInsuranceStatus: z.array(z.string()).optional(),
    vehiclePUCStatus: z.array(z.string()).optional(),
    vehicleFitnessStatus: z.array(z.string()).optional(),
    vehicleServiceDueStatus: z.array(z.string()).optional(),
    vehicleFuelType: z.array(z.string()).optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict()
  .transform(
    ({
      vehicleStatus,
      vehicleAssignee,
      vehicleInsuranceStatus,
      vehiclePUCStatus,
      vehicleFitnessStatus,
      vehicleServiceDueStatus,
      vehicleFuelType,
      ...rest
    }) => {
      return {
        ...rest,
        assignedTo: vehicleAssignee,
        statuses: vehicleStatus,
        insuranceStatuses: vehicleInsuranceStatus,
        pucStatuses: vehiclePUCStatus,
        fitnessStatuses: vehicleFitnessStatus,
        serviceDueStatuses: vehicleServiceDueStatus,
        fuelTypes: vehicleFuelType,
      };
    }
  );

export const VehicleGetBaseResponseSchema = z
  .object({
    ...VehicleBaseSchema.shape,
    assignedTo: uuidField.nullable().optional(),
    assignedToUser: makeFieldsNullable(UserSchema).nullable(),
    vehicleMasterId: uuidField,
    lastServiceKm: z.number().int().nonnegative().nullable(),
    lastServiceDate: isoDateTimeField.nullable(),
    currentOdometerKm: z.string().min(1).nullable(),
    insuranceStatus: z.string().min(1),
    pucStatus: z.string().min(1),
    fitnessStatus: z.string().min(1),
    serviceDueStatus: z.string().min(1),
    nextServiceDueKm: z.number().int().nonnegative().nullable(),
    kmToNextService: z.number().nullable(), // TODO: Can be negative
    kmSinceLastService: z.number().nullable(), // TODO: Can be negative
    files: z.array(VehicleBaseDocumentsSchema),
    associatedCard: z
      .object({
        id: uuidField,
        cardNumber: z.string().min(1),
        cardType: z.string().min(1),
        cardName: z.string().min(1),
        holderName: z.string().min(1).nullable(),
        expiryDate: z.string().min(1).nullable(),
        expiryStatus: z.string().min(1).nullable(),
      })
      .strict()
      .nullable(),
    createdAt,
    updatedAt,
    deletedAt,
  })
  .strict()
  .transform(({ files, ...rest }) => ({
    ...rest,
    documentKeys: files.map(file => file.fileKey),
  }));

export const VehicleGetStatsResponseSchema = z
  .object({
    total: z.number().int().nonnegative(),
    byStatus: z.object({
      available: z.number().int().nonnegative(),
      assigned: z.number().int().nonnegative(),
      underMaintenance: z.number().int().nonnegative(),
      damaged: z.number().int().nonnegative(),
      retired: z.number().int().nonnegative(),
    }),
    byFuelType: z.object({
      petrol: z.number().int().nonnegative(),
      diesel: z.number().int().nonnegative(),
      electric: z.number().int().nonnegative(),
      hybrid: z.number().int().nonnegative(),
      cng: z.number().int().nonnegative(),
    }),
    insuranceStatus: z.object({
      active: z.number().int().nonnegative(),
      expiringSoon: z.number().int().nonnegative(),
      expired: z.number().int().nonnegative(),
      notApplicable: z.number().int().nonnegative(),
    }),
    pucStatus: z.object({
      active: z.number().int().nonnegative(),
      expiringSoon: z.number().int().nonnegative(),
      expired: z.number().int().nonnegative(),
      notApplicable: z.number().int().nonnegative(),
    }),
    fitnessStatus: z.object({
      active: z.number().int().nonnegative(),
      expiringSoon: z.number().int().nonnegative(),
      expired: z.number().int().nonnegative(),
      notApplicable: z.number().int().nonnegative(),
    }),
    serviceDueStatus: z.object({
      ok: z.number().int().nonnegative(),
      dueSoon: z.number().int().nonnegative(),
      overdue: z.number().int().nonnegative(),
    }),
  })
  .strict();

export const VehicleGetResponseSchema = z
  .object({
    records: z.array(VehicleGetBaseResponseSchema),
    stats: VehicleGetStatsResponseSchema.strict(),
    totalRecords: z.number().int().nonnegative(),
  })
  .strict();
