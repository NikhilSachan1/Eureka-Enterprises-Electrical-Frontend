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
      data.company ||
      data.contractor ||
      data.vehicle ||
      toAssignedDriverIds(data.assignedDriver).length
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
              city: c?.city,
              state: c?.state,
            })),
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
