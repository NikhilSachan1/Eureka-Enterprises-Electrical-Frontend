import { z } from 'zod';
import { AttendanceBaseSchema } from './base-attendance.schema';
import { dateField } from '@shared/schemas/common.schema';
import { SHIFT_DATA } from '@shared/config/static-data.config';
import { transformDateFormat } from '@shared/utility';

const { notes, status, id } = AttendanceBaseSchema.shape;

export const AttendanceForceRequestSchema = z
  .object({
    employeeName: id,
    attendanceDate: dateField,
    attendanceStatus: status,
    clientName: z.string(),
    locationName: z.string(),
    associateEngineerName: z.string(),
    associatedVehicle: z.string(),
    remark: notes,
  })
  .strict()
  .transform(data => ({
    userIds: data.employeeName,
    attendanceDate: transformDateFormat(data.attendanceDate),
    notes: `${data.locationName} - ${data.clientName}`,
    reason: data.remark,
    status: data.attendanceStatus,
    checkInTime: SHIFT_DATA.START_TIME,
    checkOutTime: SHIFT_DATA.END_TIME,
  }));

export const AttendanceForceResponseSchema = z
  .object({
    message: z.string().min(1),
  })
  .strict();
