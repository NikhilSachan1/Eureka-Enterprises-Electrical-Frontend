export const API_ROUTES = {
  APP_CONFIGUATION: {
    GET: 'configurations',
  },
  EMPLOYEE: {
    ADD: 'user',
    LIST: 'user',
    GET_EMPLOYEE_BY_ID: (employeeId: string) => `user/${employeeId}`,
    GET_EMPLOYEE_PROFILE: 'user/me',
    GET_NEXT_EMPLOYEE_ID: 'user/next-employee-id',
    EDIT: (employeeId: string) => `user/${employeeId}`,
    DELETE: 'user',
    SEND_PASSWORD_LINK: 'user/resend-password-link',
  },
  ATTACHMENTS: {
    GET_FILE_URL: 'files',
  },
  AUTH: {
    LOGIN: 'auth/sign-in',
    LOGOUT: 'auth/sign-out',
    REFRESH_TOKEN: 'auth/refresh-token',
    FORGOT_PASSWORD: 'auth/forget-password',
    RESET_PASSWORD: (token: string) => `auth/reset-password/${token}`,
    SWITCH_ACTIVE_ROLE: 'auth/switch-role',
  },
  ATTENDANCE: {
    LIST: 'attendance',
    HISTORY: 'attendance/history',
    CURRENT_STATUS: 'attendance/current-status',
    APPLY: 'attendance/action',
    FORCE: 'attendance/force',
    REGULARIZE: (attendanceId: string) =>
      `attendance/${attendanceId}/regularize`,
    APPROVAL_ACTION: 'attendance/approval',
  },
  EXPENSE: {
    LIST: 'expenses',
    ADD: 'expenses/debit',
    FORCE: 'expenses/force',
    REIMBURSE: 'expenses/credit',
    EDIT: (expenseId: string) => `expenses/${expenseId}`,
    DELETE: 'expenses',
    APPROVAL_ACTION: 'expenses/approval',
    GET_EXPENSE_BY_ID: (expenseId: string) => `expenses/${expenseId}/history`,
  },
  FUEL_EXPENSE: {
    LIST: 'fuel-expenses',
    ADD: 'fuel-expenses',
    FORCE: 'fuel-expenses/force',
    REIMBURSE: 'fuel-expenses/credit',
    EDIT: (fuelExpenseId: string) => `fuel-expenses/${fuelExpenseId}`,
    DELETE: 'fuel-expenses',
    APPROVAL_ACTION: 'fuel-expenses/approval',
    GET_FUEL_EXPENSE_BY_ID: (fuelExpenseId: string) =>
      `fuel-expenses/${fuelExpenseId}/history`,
  },
  LEAVE: {
    LIST: 'leave',
    APPLY: 'leave/apply',
    FORCE: 'leave/force',
    APPROVAL_ACTION: 'leave/approval',
  },
  ASSET: {
    LIST: 'assets',
    ADD: 'assets',
    DELETE: 'assets',
    EDIT: (assetId: string) => `assets/${assetId}`,
    GET_ASSET_BY_ID: (assetId: string) => `assets/${assetId}`,
    ACTION: 'assets/action',
    GET_ASSET_EVENT_HISTORY: (assetId: string) => `asset-events/${assetId}`,
  },
  VEHICLE: {
    LIST: 'vehicles',
    ADD: 'vehicles',
    DELETE: 'vehicles',
    EDIT: (vehicleId: string) => `vehicles/${vehicleId}`,
    GET_VEHICLE_BY_ID: (vehicleId: string) => `vehicles/${vehicleId}`,
    ACTION: 'vehicles/action',
    GET_VEHICLE_EVENT_HISTORY: (vehicleId: string) =>
      `vehicle-events/${vehicleId}`,
    GET_LINKED_USER_VEHICLE_DETAIL: 'vehicles/assigned',
  },
  VEHICLE_SERVICE: {
    ADD: 'vehicle-service',
    DELETE: 'vehicle-service/bulk',
    EDIT: (vehicleServiceId: string) => `vehicle-service/${vehicleServiceId}`,
    LIST: 'vehicle-service',
    GET_VEHICLE_SERVICE_BY_ID: (vehicleServiceId: string) =>
      `vehicle-service/${vehicleServiceId}`,
  },
  VEHICLE_READING: {
    ADD: 'vehicle-logs',
    LIST: 'vehicle-logs',
    GET_VEHICLE_READING_BY_ID: (vehicleReadingId: string) =>
      `vehicle-logs/${vehicleReadingId}`,
    EDIT: (vehicleReadingId: string) => `vehicle-logs/${vehicleReadingId}`,
  },
  PETRO_CARD: {
    LIST: 'cards',
    ADD: 'cards',
    DELETE: 'cards/bulk',
    EDIT: (petroCardId: string) => `cards/${petroCardId}`,
    LINK: 'cards/action',
  },
  PAYROLL: {
    GENERATE: 'payroll/generate-bulk',
    GET_PAYSLIP_LIST: 'payroll',
    GET_PAYSLIP_BLOB: (payslipId: string) => `payroll/${payslipId}/payslip`,
    GET_PAYSLIP_BY_ID: (payslipId: string) => `payroll/${payslipId}`,
    STRUCTURE: 'salary-structures',
    GET_STRUCTURE_HISTORY: (structureId: string) =>
      `salary-structures/${structureId}/change-history`,
    ADD_SALARY_INCREMENT: 'salary-structures/increment',
    EDIT: (salaryStructureId: string) =>
      `salary-structures/${salaryStructureId}`,
    ACTION: 'payroll/bulk-status-update',
    CANCEL: 'payroll/bulk-cancel',
  },
  SETTINGS: {
    PERMISSION: {
      SYSTEM: {
        ADD: 'permissions',
        LIST: 'permissions',
        UPDATE: (permissionId: string) => `permissions/${permissionId}`,
        DELETE: 'permissions/bulk',
      },
      ROLE: {
        LIST: 'role',
        ADD: 'role',
        UPDATE: (roleId: string) => `role/${roleId}`,
        DELETE: 'role/bulk',
      },
      ROLE_PERMISSION: {
        LIST: 'role-permissions',
        SET: 'role-permissions/bulk',
      },
      USER: {
        LIST: 'user-permissions/stats',
      },
      USER_PERMISSION: {
        LIST: 'user-permissions',
        SET: 'user-permissions/bulk',
        DELETE: 'user-permissions/bulk-by-users',
        CHANGE_ROLE: (userId: string) => `user-roles/user/${userId}`,
      },
    },
    CONFIGURATION: {
      LIST: 'configurations',
      ADD: 'configurations',
    },
  },
  SITE: {
    COMPANY: {
      LIST: 'companies',
      ADD: 'companies',
      DELETE: 'companies',
      EDIT: (companyId: string) => `companies/${companyId}`,
      GET_COMPANY_BY_ID: (companyId: string) => `companies/${companyId}`,
    },
    CONTRACTOR: {
      LIST: 'contractors',
      ADD: 'contractors',
      DELETE: 'contractors',
      EDIT: (contractorId: string) => `contractors/${contractorId}`,
      GET_CONTRACTOR_BY_ID: (contractorId: string) =>
        `contractors/${contractorId}`,
    },
    PROJECT: {
      LIST: 'sites',
      ADD: 'sites',
      DELETE: 'sites',
      EDIT: (projectId: string) => `sites/${projectId}`,
      GET_PROJECT_BY_ID: (projectId: string) => `sites/${projectId}`,
      CHANGE_STATUS: (projectId: string) => `sites/${projectId}/status`,
    },
    DSR: {
      ADD: 'daily-status-reports',
      EDIT: (dsrId: string) => `daily-status-reports/${dsrId}`,
      DELETE: (dsrId: string) => `daily-status-reports/${dsrId}`,
      LIST: 'daily-status-reports',
    },
  },
  ANNOUNCEMENT: {
    ADD: 'announcement',
    LIST: 'announcement',
    UNACKNOWLEDGE_LIST: 'announcement/unacknowledged',
    GET_ANNOUNCEMENT_BY_ID: (announcementId: string) =>
      `announcement/${announcementId}`,
    EDIT: (announcementId: string) => `announcement/${announcementId}`,
    DELETE: 'announcement/bulk',
    ACKNOWLEDGE: 'announcement/acknowledge',
  },
} as const;

export const SKIP_AUTH_ENDPOINTS = [
  API_ROUTES.AUTH.LOGIN,
  API_ROUTES.AUTH.FORGOT_PASSWORD,
  API_ROUTES.AUTH.RESET_PASSWORD,
  API_ROUTES.AUTH.REFRESH_TOKEN,
] as const;
