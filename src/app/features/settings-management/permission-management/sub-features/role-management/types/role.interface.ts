import { IRoleGetBaseResponseDto } from './role.dto';

export interface IRolePermissionCount {
  current: number;
  total: number;
}

export interface IRole
  extends Pick<IRoleGetBaseResponseDto, 'id' | 'isEditable' | 'isDeletable'> {
  roleCode: string;
  roleDescription: string;
  roleLabel: string;
  rolePermissionCount: IRolePermissionCount;
  originalRawData: IRoleGetBaseResponseDto;
}
