import { PartialExcept } from '@app/shared/utility/typescript.utility';
import { ISystemPermissionGetBaseResponseDto } from './system-permission.dto';

export interface IModulePermission {
  readonly id: string;
  readonly moduleName: string;
  permissions: PartialExcept<
    ISystemPermissionGetBaseResponseDto,
    'id' | 'description' | 'label'
  >[];
}
