import { IUserGetBaseResponseDto } from './user.dto';

export interface IUser extends Pick<IUserGetBaseResponseDto, 'id'> {
  employeeName: string;
  employeeCode: string;
  employeeStatus: string;
  employeeRole: string;
  userPermissionCount: string;
  originalRawData: IUserGetBaseResponseDto;
}
