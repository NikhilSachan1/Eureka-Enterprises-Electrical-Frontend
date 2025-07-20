import { PartialExcept } from '@shared/utility/typescript.utility';
import { IGetSingleSystemPermissionListResponseDto } from '@features/settings-management/permission-management/system-permission-management/models/system-permission.api.model';

export interface IModulePermission {
  readonly id: string;
  readonly moduleName: string;
  permissions: PartialExcept<
    IGetSingleSystemPermissionListResponseDto,
    'id' | 'description' | 'label'
  >[];
}
