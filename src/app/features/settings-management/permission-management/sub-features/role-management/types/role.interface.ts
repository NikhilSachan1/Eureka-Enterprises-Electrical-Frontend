import { IRoleGetBaseResponseDto } from './role.dto';

export interface IRole
  extends Pick<IRoleGetBaseResponseDto, 'id' | 'isEditable' | 'isDeletable'> {
  roleCode: string;
  roleDescription: string;
  roleLabel: string;
  originalRawData: IRoleGetBaseResponseDto;
}
