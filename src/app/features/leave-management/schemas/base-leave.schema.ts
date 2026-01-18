import {
  AuditSchema,
  dateField,
  isoDateTimeField,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import z from 'zod';
import { EApprovalStatus, EEntrySourceType, EEntryType } from '@shared/types';
import { makeFieldsNullable } from '@shared/utility';

export const approvalStatusSchema = z.enum(EApprovalStatus);
export const entrySourceTypeSchema = z.enum(EEntrySourceType);
export const leaveEntryTypeSchema = z.enum(EEntryType);
const { createdAt, updatedAt, createdBy } = AuditSchema.shape;

export const LeaveBaseSchema = z
  .object({
    id: uuidField,
    userId: uuidField,
    leaveType: z.string().min(1),
    leaveCategory: z.string().min(1),
    leaveApplicationType: leaveEntryTypeSchema,
    fromDate: isoDateTimeField,
    toDate: isoDateTimeField,
    reason: z.string().trim(),
    approvalStatus: approvalStatusSchema,
    approvalAt: isoDateTimeField.nullable(),
    approvalBy: uuidField.nullable(),
    approvalReason: z.string().trim().nullable(),
    entrySourceType: entrySourceTypeSchema,
    approvalByUser: makeFieldsNullable(UserSchema).nullable(),
    user: UserSchema,
    createdByUser: UserSchema,
    createdAt,
    updatedAt,
    createdBy,
  })
  .strict();

export const LeaveUpsertShapeSchema = z.object({
  leaveDate: z.array(dateField),
  leaveReason: z.string().trim(),
});
