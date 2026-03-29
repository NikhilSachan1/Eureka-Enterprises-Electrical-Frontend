import {
  AuditSchema,
  uuidField,
  isoDateTimeField,
  onlyDateStringField,
} from '@shared/schemas';
import { z } from 'zod';
import { EEntrySourceType, EEntryType } from '@shared/types';

export const notesField = z.string().trim();
export const entrySourceTypeSchema = z.enum(EEntrySourceType);
export const attendanceTypeSchema = z.enum(EEntryType);

const auditSchema = AuditSchema.shape;

export const AttendanceBaseSchema = z
  .object({
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
    ...auditSchema,
  })
  .strict();
