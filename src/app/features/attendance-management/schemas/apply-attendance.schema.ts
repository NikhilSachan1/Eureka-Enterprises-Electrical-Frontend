import { z } from 'zod';
import {
  AttendanceBaseSchema,
  AttendanceUpsertShapeSchema,
} from './base-attendance.schema';
import { EApplyAttendanceAction } from '../types/attendance.enum';
import { toAssignedDriverIds } from '../utility/attendance-assignment.util';

const { checkInTime } = AttendanceBaseSchema.shape;

export const AttendanceApplyRequestSchema =
  AttendanceUpsertShapeSchema.strict().transform(data => ({
    notes: data.remark,
    action: EApplyAttendanceAction.CHECK_IN,
    assignmentSnapshot:
      data.vehicle || toAssignedDriverIds(data.assignedDriver).length
        ? {
            vehicle: data.vehicle
              ? {
                  id: data.vehicle.id,
                  registrationNo: data.vehicle.registrationNo,
                }
              : null,
            assignedDrivers: toAssignedDriverIds(data.assignedDriver),
          }
        : null,
  }));

export const AttendanceApplyResponseSchema = z.looseObject({
  checkInTime,
  message: z.string(),
});
