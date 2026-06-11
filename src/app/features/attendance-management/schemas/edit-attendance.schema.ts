import { z } from 'zod';
import {
  AttendanceBaseSchema,
  AttendanceUpsertShapeSchema,
} from './base-attendance.schema';
import { EAttendanceStatus } from '../types/attendance.enum';
import { ELeaveCategory } from '@features/leave-management/types/leave.type';
import { isAttendanceAssignmentApplicable } from '../utility/attendance-assignment.util';

const { status } = AttendanceBaseSchema.shape;

export const AttendanceEditRequestSchema = AttendanceUpsertShapeSchema.extend({
  attendanceStatus: status,
})
  .strict()
  .transform(data => ({
    notes: data.remark,
    reason: data.remark,
    status: data.attendanceStatus,
    assignmentSnapshot: isAttendanceAssignmentApplicable(data.attendanceStatus)
      ? {
          company: data.company
            ? {
                id: data.company.id,
                name: data.company.name,
                fullAddress: data.company.fullAddress,
              }
            : null,
          contractors: (data.contractor ? [data.contractor] : []).map(c => ({
            id: c?.id,
            name: c?.name,
          })),
          vehicle: data.vehicle
            ? {
                id: data.vehicle.id,
                registrationNo: data.vehicle.registrationNo,
              }
            : null,
          assignedEngineer: data.assignedEngineer
            ? {
                id: data.assignedEngineer.id,
                firstName: data.assignedEngineer.firstName,
                lastName: data.assignedEngineer.lastName,
                employeeId: data.assignedEngineer.employeeId,
              }
            : null,
        }
      : null,
    leaveCategory:
      data.attendanceStatus === EAttendanceStatus.LEAVE
        ? ELeaveCategory.EARNED
        : null,
  }));

export const AttendanceEditResponseSchema = z.looseObject({
  message: z.string().min(1),
});
