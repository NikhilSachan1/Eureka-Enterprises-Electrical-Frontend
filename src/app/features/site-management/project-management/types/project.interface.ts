import {
  IDsrDetailGetResponseDto,
  IDsrGetBaseResponseDto,
  IProjectGetBaseResponseDto,
} from './project.dto';

export interface IProject extends Pick<IProjectGetBaseResponseDto, 'id'> {
  projectName: string;
  projectLocation: string | null;
  projectStatus: string;
  timeLine: Date[];
  estimatedBudget: string;
  originalRawData: IProjectGetBaseResponseDto;
}

export interface IDsr
  extends Pick<
    IDsrGetBaseResponseDto,
    | 'id'
    | 'reportDate'
    | 'reportingEngineerName'
    | 'reportingEngineerContact'
    | 'remarks'
  > {
  workTypes: string;
  createdByUser: IDsrGetBaseResponseDto['createdByUser'] & {
    fullName: string;
  };
  originalRawData: IDsrGetBaseResponseDto;
}

export interface IDsrDetailResolverResponse extends IDsrDetailGetResponseDto {
  preloadedFiles?: File[];
}

export interface IProjectTimelineMeta {
  siteName: string;
  currentStatus: string;
  completionPercent?: number;
  daysElapsed: number;
  daysRemaining: number;
}

export interface IProjectTimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  icon?: string;
}
