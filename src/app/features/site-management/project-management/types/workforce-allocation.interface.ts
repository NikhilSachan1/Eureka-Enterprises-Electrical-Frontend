import { IWorkforceAllocationGetBaseResponseDto } from './project.dto';

export interface IWorkforceAllocation {
  id: string;
  employeeName: string;
  employeeCode: string;
  allocatedStatus: string;
  projectName: string | null;
  projectLocation: string | null;
  companyName: string | null;
  companyLocation: string | null;
  allocatedSince: Date | null;
  allocationId: string | null;
  originalRawData: IWorkforceAllocationGetBaseResponseDto;
}
