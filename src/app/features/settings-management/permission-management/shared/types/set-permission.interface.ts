export interface ICategorizedPermissions {
  defaultPermissions: string[];
  revokedPermissions: string[];
  newPermissions: string[];
}

export interface IModuleStats {
  label: string;
  value: number;
  colorClass: string;
  icon?: string;
}

export interface IPermissionData {
  value: boolean;
  source?: 'override' | 'role';
}

export type IDefaultPermissions = Record<string, IPermissionData>;

export interface IRolePermissionMatrixColumn {
  id: string;
  label: string;
  name: string;
}

export interface IMatrixRolePermissionUpdate {
  roleId: string;
  categorizedPermissions: ICategorizedPermissions;
}

export interface IMatrixModuleSaveEvent {
  moduleId: string;
  roleUpdates: IMatrixRolePermissionUpdate[];
}

export interface IMatrixRoleStatsSummary {
  roleId: string;
  label: string;
  name: string;
  total: number;
  currentGranted: number;
  stats: IModuleStats[];
  pending: number;
}
