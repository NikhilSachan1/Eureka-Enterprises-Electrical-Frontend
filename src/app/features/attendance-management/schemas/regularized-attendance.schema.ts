import { z } from 'zod';
import {
  AttendanceBaseSchema,
  AttendanceUpsertShapeSchema,
} from './base-attendance.schema';
import { SHIFT_DATA } from '@shared/config';
import { EAttendanceStatus } from '../types/attendance.enum';
import { ELeaveCategory } from '@features/leave-management/types/leave.type';
import { isAttendanceAssignmentApplicable } from '../utility/attendance-assignment.util';

const { id, status, userId } = AttendanceBaseSchema.shape;

export const AttendanceRegularizedRequestSchema =
  AttendanceUpsertShapeSchema.omit({ remark: true })
    .extend({
      attendanceStatus: status,
      employeeName: userId,
    })
    .strict()
    .transform(data => ({
      status: data.attendanceStatus,
      checkInTime: SHIFT_DATA.START_TIME,
      checkOutTime: SHIFT_DATA.END_TIME,
      userId: data.employeeName,
      leaveCategory:
        data.attendanceStatus === EAttendanceStatus.LEAVE
          ? ELeaveCategory.EARNED
          : null,
      ...(isAttendanceAssignmentApplicable(data.attendanceStatus)
        ? {
            assignmentSnapshot: {
              company: data.company
                ? {
                    id: data.company.id,
                    name: data.company.name,
                    fullAddress: data.company.fullAddress,
                  }
                : null,
              contractors: (data.contractor ? [data.contractor] : []).map(
                c => ({
                  id: c?.id,
                  name: c?.name,
                })
              ),
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
            },
          }
        : {}),
    }));

export const AttendanceRegularizedResponseSchema = z.looseObject({
  message: z.string().min(1),
  attendanceId: id,
});
