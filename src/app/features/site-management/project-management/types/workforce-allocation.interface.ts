import { IWorkforceAllocationGetBaseResponseDto } from './project.dto';

export interface IWorkforceAllocation {
  id: string;
  employeeName: string;
  employeeCode: string;
  allocatedStatus: string;
  projectName: string | null;
  allocatedSince: Date | null;
  originalRawData: IWorkforceAllocationGetBaseResponseDto;
}
