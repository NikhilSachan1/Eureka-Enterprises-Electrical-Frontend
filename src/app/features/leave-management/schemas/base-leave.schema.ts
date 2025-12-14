import {
  AuditSchema,
  isoDateTimeField,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import z from 'zod';
import { EApprovalStatus, EEntrySourceType, EEntryType } from '@shared/types';
import {
  LEAVE_DAY_TYPE_DATA,
  LEAVE_TYPE_DATA,
} from '@shared/config/static-data.config';
import { makeFieldsNullable } from '@shared/utility';

export const approvalStatusSchema = z.enum(EApprovalStatus);
export const entrySourceTypeSchema = z.enum(EEntrySourceType);
export const leaveEntryTypeSchema = z.enum(EEntryType);
const { createdAt, updatedAt, createdBy } = AuditSchema.shape;

export const LeaveBaseSchema = z
  .object({
    id: uuidField,
    userId: uuidField,
    leaveType: z.enum(LEAVE_DAY_TYPE_DATA.map(item => item.value)),
    leaveCategory: z.enum(LEAVE_TYPE_DATA.map(item => item.value)),
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
