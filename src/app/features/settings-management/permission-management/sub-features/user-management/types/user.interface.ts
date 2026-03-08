import { IUserGetBaseResponseDto } from './user.dto';

export interface IUserPermissionCount {
  grantedUser: number;
  revokedUser: number;
  role: number;
  total: number;
}

export interface IUser extends Pick<IUserGetBaseResponseDto, 'id'> {
  employeeName: string;
  employeeCode: string;
  employeeStatus: string;
  employeeRole: string | null;
  userPermissionCount: IUserPermissionCount;
  originalRawData: IUserGetBaseResponseDto;
}
