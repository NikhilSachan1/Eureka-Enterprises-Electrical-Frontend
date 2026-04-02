import { IProjectGetBaseResponseDto } from './project.dto';

export interface IProjectStakeholders {
  company: IProjectGetBaseResponseDto['company'];
  siteContractors: IProjectGetBaseResponseDto['siteContractors'];
  allocatedEmployees: IProjectGetBaseResponseDto['allocatedEmployees'];
}

export interface IProject
  extends Pick<
    IProjectGetBaseResponseDto,
    'id' | 'profitPercentage' | 'totalSpent' | 'workTypes'
  > {
  projectName: string;
  projectLocation: string | null;
  projectStatus: string;
  timeLine: Date[];
  estimatedBudget: string;
  projectManager: string;
  projectManagerContact: string | null;
  stakeholders: IProjectStakeholders;
  originalRawData: IProjectGetBaseResponseDto;
}
