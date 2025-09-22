export interface ILeave {
  id: string;
  leaveApplicationType: 'self' | 'forced';
  fromDate: string;
  toDate: string;
  reason: string;
  approvalStatus: string;
  approvalAt: string | null;
  approvalReason: string | null;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  employeeName: string;
  employeeCode: string | undefined;
  approvalByUser: string | null;
  createdByUser: string;
}
