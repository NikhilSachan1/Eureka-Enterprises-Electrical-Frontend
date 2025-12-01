import {
  AuditSchema,
  uuidField,
  isoDateTimeField,
  onlyDateStringField,
} from '@shared/schemas';
import { z } from 'zod';
import { EAttendanceStatus } from '../types/attendance.enum';
import { EEntrySourceType, EEntryType, EApprovalStatus } from '@shared/types';

export const notesField = z.string().trim();
export const entrySourceTypeSchema = z.enum(EEntrySourceType);
export const attendanceTypeSchema = z.enum(EEntryType);
export const approvalStatusSchema = z.enum(EApprovalStatus);
export const attendanceStatusSchema = z.enum(EAttendanceStatus);

const auditSchema = AuditSchema.shape;

export const AttendanceBaseSchema = z
  .object({
    id: uuidField,
    userId: uuidField,
    shiftConfigId: uuidField,
    attendanceDate: onlyDateStringField,
    checkInTime: isoDateTimeField.nullable(),
    checkOutTime: isoDateTimeField.nullable(),
    status: attendanceStatusSchema,
    approvalStatus: approvalStatusSchema,
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
