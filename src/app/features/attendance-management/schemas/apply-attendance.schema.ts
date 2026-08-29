import { z } from 'zod';
import {
  AttendanceBaseSchema,
  AttendanceUpsertShapeSchema,
  toAssignmentSnapshotPerson,
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
      contractors: (data.contractor ? [data.contractor] : []).map(c => ({
        id: c?.id,
        name: c?.name,
      })),
      vehicle: {
        id: data.vehicle?.id,
        registrationNo: data.vehicle?.registrationNo,
      },
      assignedEngineer: toAssignmentSnapshotPerson(data.assignedEngineer),
      assignedDriver: toAssignmentSnapshotPerson(data.assignedDriver),
    },
  }));

export const AttendanceApplyResponseSchema = z.looseObject({
  checkInTime,
  message: z.string(),
});
