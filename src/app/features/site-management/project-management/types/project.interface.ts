import { IProjectGetBaseResponseDto } from './project.dto';

export interface IProjectStakeholders {
  company: IProjectGetBaseResponseDto['company'];
  siteContractors: IProjectGetBaseResponseDto['siteContractors'];
  vendors: IProjectGetBaseResponseDto['vendors'];
  allocatedEmployees: IProjectGetBaseResponseDto['allocatedEmployees'];
}

export interface IProject
  extends Pick<IProjectGetBaseResponseDto, 'id' | 'workTypes' | 'siteTypes'> {
  projectName: string;
  projectLocation: string | null;
  projectStatus: string;
  timeLine: Date[];
  projectManager: string;
  projectManagerContact: string | null;
  stakeholders: IProjectStakeholders;
  originalRawData: IProjectGetBaseResponseDto;
}

export interface IProjectWorkspaceSearchFilterFormDto {
  projectName?: string;
  companyName?: string[];
  contractorName?: string[];
  vendorName?: string[];
  approvalStatus?: string[];
  dateRange?: Date[];
  search?: string;
  paidFromAccount?: string;
}
