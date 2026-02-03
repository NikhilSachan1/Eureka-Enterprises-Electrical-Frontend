import { IProjectGetBaseResponseDto } from './project.dto';

export interface IProject extends Pick<IProjectGetBaseResponseDto, 'id'> {
  projectName: string;
  projectLocation: string | null;
  projectStatus: string;
  timeLine: Date[];
  estimatedBudget: string;
  originalRawData: IProjectGetBaseResponseDto;
}
