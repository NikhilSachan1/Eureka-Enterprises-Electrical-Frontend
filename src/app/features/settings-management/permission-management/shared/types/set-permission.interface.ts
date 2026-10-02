export interface ICategorizedPermissions {
  defaultPermissions: string[];
  revokedPermissions: string[];
  newPermissions: string[];
}

export interface IPermissionData {
  value: boolean;
  source?: 'override' | 'role';
}

export type IDefaultPermissions = Record<string, IPermissionData>;

export interface IRolePermissionMatrixColumn {
  id: string;
  label: string;
}

export interface IMatrixRolePermissionUpdate {
  roleId: string;
  categorizedPermissions: ICategorizedPermissions;
}

/** Every pending change across all modules, grouped per role or user. */
export interface IPermissionSaveEvent {
  roleUpdates: IMatrixRolePermissionUpdate[];
}

/** Per-column (role or user) roll-up for the module currently being edited. */
export interface IPermissionColumnSummary {
  id: string;
  label: string;
  total: number;
  granted: number;
  pending: number;
  allGranted: boolean;
}
