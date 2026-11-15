import {
  ILeaveGetBaseResponseDto,
  ILeaveGroupGetBaseResponseDto,
} from './leave.dto';
import { ILeaveStatusChip } from '../utils/leave.util';

/** One day of a leave application, as a child row of the expanded application. */
export interface ILeaveDay {
  id: string;
  leaveDay: string;
  approvalStatus: string;
  originalRawData: ILeaveGetBaseResponseDto;
}

/** One leave application (all the days applied together) as a list row. */
export interface ILeaveGroup {
  id: string;
  employeeName: string;
  employeeCode: string;
  leaveDate: string[];
  dayCountLabel: string;
  reason: string;
  approvalStatus: string;
  /** Days per status, e.g. [3 Approved] [1 Rejected]. */
  statusChips: ILeaveStatusChip[];
  days: ILeaveDay[];
  originalRawData: ILeaveGroupGetBaseResponseDto;
}
