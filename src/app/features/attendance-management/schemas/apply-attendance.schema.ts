import { z } from 'zod';
import { AttendanceBaseSchema } from './base-attendance.schema';
import { EApplyAttendanceAction } from '../types/attendance.enum';

const { checkInTime, checkOutTime } = AttendanceBaseSchema.shape;

const SiteSnapshotSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().optional(),
    fullAddress: z.string().optional(),
  })
  .passthrough();

const CompanySnapshotSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().optional(),
    fullAddress: z.string().optional(),
  })
  .passthrough();

const ContractorSnapshotSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().optional(),
  })
  .passthrough();

const VehicleSnapshotSchema = z
  .object({
    id: z.string().uuid().optional(),
    registrationNo: z.string().optional(),
  })
  .passthrough();

const AssignedEngineerSnapshotSchema = z
  .object({
    id: z.string().uuid().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    employeeId: z.string().optional(),
  })
  .passthrough();

export const AssignmentSnapshotSchema = z.object({
  site: SiteSnapshotSchema.default({}),
  company: CompanySnapshotSchema.default({}),
  contractors: z.array(ContractorSnapshotSchema).default([]),
  vehicle: VehicleSnapshotSchema.nullable().optional(),
  assignedEngineer: AssignedEngineerSnapshotSchema.nullable().optional(),
});

export const AttendanceApplyRequestSchema = z.object({
  action: z.nativeEnum(EApplyAttendanceAction),
  notes: z.string(),
  assignmentSnapshot: AssignmentSnapshotSchema,
});

export const AttendanceApplyFormSchema = z.object({
  locationName: z.string(),
  clientName: z.string(),
  associateEngineerName: z.string(),
  associatedVehicle: z.string(),
  notes: z.string().optional(),
});

export const AttendanceApplyResponseSchema = z.object({
  checkInTime: checkInTime.nullable().optional(),
  checkOutTime: checkOutTime.nullable().optional(),
  message: z.string(),
});
