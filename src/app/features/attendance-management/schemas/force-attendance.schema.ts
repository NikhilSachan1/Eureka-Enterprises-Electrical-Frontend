import { z } from 'zod';
import {
  AttendanceBaseSchema,
  AttendanceUpsertShapeSchema,
} from './base-attendance.schema';
import { dateField } from '@shared/schemas/common.schema';
import { transformDateFormat } from '@shared/utility';
import { SHIFT_DATA } from '@shared/config';

const { status, id } = AttendanceBaseSchema.shape;

export const AttendanceForceRequestSchema = AttendanceUpsertShapeSchema.extend({
  employeeName: id,
  attendanceDate: dateField,
  attendanceStatus: status,
})
  .strict()
  .transform(data => ({
    userIds: data.employeeName,
    attendanceDate: transformDateFormat(data.attendanceDate),
    notes: data.remark,
    reason: data.remark,
    status: data.attendanceStatus,
    checkInTime: SHIFT_DATA.START_TIME,
    checkOutTime: SHIFT_DATA.END_TIME,
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

export const AttendanceForceResponseSchema = z.looseObject({
  message: z.string().min(1),
});
