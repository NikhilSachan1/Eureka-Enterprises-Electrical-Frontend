export enum EUserRole {
  EMPLOYEE = 'EMPLOYEE',
  DRIVER = 'DRIVER',
}

export const RESTRICTED_ROLES_FOR_USER_ID: string[] = [
  EUserRole.DRIVER,
  EUserRole.EMPLOYEE,
];
