import { IRoleGetBaseResponseDto } from './role.dto';

export interface IRole
  extends Omit<IRoleGetBaseResponseDto, 'permissionCount'> {
  permissionCount: string;
}
