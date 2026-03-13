import { z } from 'zod';
import { uuidField, UserSchema } from '@shared/schemas';
import { AttendanceBaseSchema } from './base-attendance.schema';

const {
  id,
  checkInTime,
  checkOutTime,
  status,
  approvalStatus,
  workDuration,
  attendanceDate,
} = AttendanceBaseSchema.shape;

const SiteSchema = z.object({
  id: uuidField,
  name: z.string(),
  fullAddress: z.string(),
});

const CompanySchema = z.object({
  id: uuidField,
  name: z.string(),
  fullAddress: z.string(),
});

const ContractorSchema = z.object({
  id: uuidField,
  name: z.string(),
});

const VehicleSchema = z.object({
  id: uuidField,
  registrationNo: z.string(),
});

const AssignedEngineerSchema = z.object({
  id: uuidField,
  firstName: z.string(),
  lastName: z.string(),
  employeeId: z.string(),
});

export const AttendanceCurrentStatusGetResponseSchema = z
  .object({
    id,
    attendanceDate,
    checkInTime,
    checkOutTime,
    status,
    approvalStatus,
    workDuration,
    user: UserSchema,
    site: SiteSchema,
    company: CompanySchema,
    contractors: z.array(ContractorSchema),
    vehicle: VehicleSchema.nullable().optional(),
    assignedEngineer: AssignedEngineerSchema.nullable().optional(),
  })
  .strict();
