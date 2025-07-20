import { IUserGetBaseResponseDto } from './user.dto';

export interface IUser extends IUserGetBaseResponseDto {
  fullName: string;
  permissionCount: string;
}
