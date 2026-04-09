export enum EUserRole {
  EMPLOYEE = 'EMPLOYEE',
  DRIVER = 'DRIVER',
  MANAGER = 'MANAGER',
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
}

export const RESTRICTED_ROLES_FOR_USER_ID: string[] = [
  EUserRole.DRIVER,
  EUserRole.EMPLOYEE,
];
