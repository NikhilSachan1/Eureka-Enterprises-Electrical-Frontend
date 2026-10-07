import {
  AuditSchema,
  uuidField,
  isoDateTimeField,
  onlyDateStringField,
} from '@shared/schemas';
import { z } from 'zod';
import { EEntrySourceType, EEntryType } from '@shared/types';
import { VehicleBaseSchema } from '@features/transport-management/vehicle-management/schemas/base-vehicle.schema';

export const AttendanceAssignedDriverSchema = z.looseObject({
  id: uuidField,
  firstName: z.string(),
  lastName: z.string(),
  employeeId: z.string(),
});

export const AttendanceSiteSchema = z.looseObject({
  id: uuidField,
  name: z.string(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  fullAddress: z.string().optional().nullable(),
  pincode: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  managerName: z.string().optional().nullable(),
});

export const notesField = z.string().trim();
export const entrySourceTypeSchema = z.enum(EEntrySourceType);
export const attendanceTypeSchema = z.enum(EEntryType);

const auditSchema = AuditSchema.shape;

export const AttendanceBaseSchema = z.looseObject({
  id: uuidField,
  userId: uuidField,
  shiftConfigId: uuidField.nullable(),
  attendanceDate: onlyDateStringField,
  checkInTime: isoDateTimeField.nullable(),
  checkOutTime: isoDateTimeField.nullable(),
  status: z.string(),
  approvalStatus: z.string(),
  entrySourceType: entrySourceTypeSchema,
  attendanceType: attendanceTypeSchema,
  regularizedBy: uuidField.nullable(),
  approvalBy: uuidField.nullable(),
  approvalAt: isoDateTimeField.nullable(),
  approvalComment: z.string().trim().nullable(),
  notes: notesField,
  isActive: z.boolean(),
  workDuration: z.number().int().nonnegative(),
  assignmentSnapshot: z
    .looseObject({
      company: z
        .looseObject({
          id: uuidField,
          name: z.string(),
          fullAddress: z.string(),
        })
        .optional()
        .nullable(),
      contractors: z
        .array(
          z
            .looseObject({
              id: uuidField,
              name: z.string(),
              city: z.string().optional().nullable(),
              state: z.string().optional().nullable(),
              gstNumber: z.string().optional().nullable(),
            })
            .optional()
            .nullable()
        )
        .optional()
        .nullable(),
      vehicle: z
        .looseObject({
          id: uuidField,
          registrationNo: z.string(),
        })
        .optional()
        .nullable(),
      assignedEngineer: AttendanceAssignedDriverSchema.optional().nullable(),
    })
    .nullable(),
  assignedDrivers: z.array(AttendanceAssignedDriverSchema).optional(),
  site: AttendanceSiteSchema.optional().nullable(),
  ...auditSchema,
});

export const AttendanceUpsertShapeSchema = z
  .object({
    vehicle: VehicleBaseSchema.nullable(),
    assignedDriver: z.union([z.string(), z.array(z.string())]).nullable(),
    remark: z.string().nullable(),
  })
  .strict();
