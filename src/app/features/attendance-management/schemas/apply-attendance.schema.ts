import { z } from 'zod';
import {
  AttendanceBaseSchema,
  AttendanceUpsertShapeSchema,
} from './base-attendance.schema';
import { EApplyAttendanceAction } from '../types/attendance.enum';

const { checkInTime } = AttendanceBaseSchema.shape;

export const AttendanceApplyRequestSchema =
  AttendanceUpsertShapeSchema.strict().transform(data => ({
    notes: data.remark,
    action: EApplyAttendanceAction.CHECK_IN,
    assignmentSnapshot: {
      company: {
        id: data.company?.id,
        name: data.company?.name,
        fullAddress: data.company?.fullAddress,
      },
      contractors: data.contractors.map(c => ({
        id: c?.id,
        name: c?.name,
      })),
      vehicle: {
        id: data.vehicle?.id,
        registrationNo: data.vehicle?.registrationNo,
      },
      assignedEngineer: {
        id: data.assignedEngineer?.id,
        firstName: data.assignedEngineer?.firstName,
        lastName: data.assignedEngineer?.lastName,
        employeeId: data.assignedEngineer?.employeeId,
      },
    },
  }));

export const AttendanceApplyResponseSchema = z.object({
  checkInTime,
  message: z.string(),
});
