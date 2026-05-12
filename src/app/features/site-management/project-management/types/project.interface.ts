import { IProjectGetBaseResponseDto } from './project.dto';

export interface IProjectStakeholders {
  company: IProjectGetBaseResponseDto['company'];
  siteContractors: IProjectGetBaseResponseDto['siteContractors'];
  allocatedEmployees: IProjectGetBaseResponseDto['allocatedEmployees'];
}

export interface IProject
  extends Pick<IProjectGetBaseResponseDto, 'id' | 'workTypes'> {
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
  contractorName?: string[];
  vendorName?: string[];
  approvalStatus?: string[];
  search?: string;
}
