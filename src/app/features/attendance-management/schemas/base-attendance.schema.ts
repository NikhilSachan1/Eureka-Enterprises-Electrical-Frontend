import {
  AuditSchema,
  uuidField,
  isoDateTimeField,
  onlyDateStringField,
} from '@shared/schemas';
import { z } from 'zod';
import { EEntrySourceType, EEntryType } from '@shared/types';
import { CompanyGetBaseResponseSchema } from '@features/site-management/company-management/schemas';
import { ContractorGetBaseResponseSchema } from '@features/site-management/contractor-management/schemas';
import { VehicleBaseSchema } from '@features/transport-management/vehicle-management/schemas/base-vehicle.schema';

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
      assignedEngineer: z
        .looseObject({
          id: uuidField,
          firstName: z.string(),
          lastName: z.string(),
          employeeId: z.string(),
        })
        .optional()
        .nullable(),
    })
    .nullable(),
  ...auditSchema,
});

export const AttendanceUpsertShapeSchema = z
  .object({
    company: CompanyGetBaseResponseSchema.nullable(),
    contractors: z.array(ContractorGetBaseResponseSchema.nullable()),
    vehicle: VehicleBaseSchema.nullable(),
    assignedEngineer: z
      .looseObject({
        id: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        employeeId: z.string(),
      })
      .nullable(),
    remark: z.string().nullable(),
  })
  .strict();
