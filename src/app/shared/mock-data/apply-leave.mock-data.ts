import { ILeaveApplyFormDto } from '@features/leave-management/types/leave.dto';

export const APPLY_LEAVE_PREFILLED_DATA: ILeaveApplyFormDto = {
  leaveDate: [new Date(), new Date()],
  leaveReason: 'Personal work - planned leave',
};
