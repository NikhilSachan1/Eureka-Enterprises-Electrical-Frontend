export interface ISetPermissionData {
  moduleWisePermissions: Record<string, string[]>;
  categorizedPermissions: ICategorizedPermissions;
}

export interface ICategorizedPermissions {
  defaultPermissions: string[];
  revokedPermissions: string[];
  newPermissions: string[];
}

export interface IModuleStats {
  label: string;
  value: number;
  colorClass: string;
}

export interface IPermissionCard {
  label: string;
  icon: string;
  cardStyle: string;
}

export interface IPermissionStats {
  global: IModuleStats[];
  modules: Record<string, IModuleStats[]>;
}
