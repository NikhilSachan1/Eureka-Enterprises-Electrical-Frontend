import { z } from 'zod';
import { AttendanceBaseSchema } from './base-attendance.schema';
import { SHIFT_DATA } from '@shared/config';
import { EAttendanceStatus } from '../types/attendance.enum';
import { ELeaveCategory } from '@features/leave-management/types/leave.type';

const { id, status, userId } = AttendanceBaseSchema.shape;

export const AttendanceRegularizedRequestSchema = z
  .object({
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
  }));

export const AttendanceRegularizedResponseSchema = z.looseObject({
  message: z.string().min(1),
  attendanceId: id,
});
