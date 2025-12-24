export const API_ROUTES = {
  EMPLOYEE: {
    ADD: 'user',
    LIST: 'user',
    GET_EMPLOYEE_BY_ID: (employeeId: string) => `user/${employeeId}`,
    EDIT: (employeeId: string) => `user/${employeeId}`,
    DELETE: 'user',
  },
  ATTACHMENTS: {
    GET_FILE_URL: 'files',
  },
  AUTH: {
    LOGIN: 'auth/sign-in',
    FORGOT_PASSWORD: 'auth/forget-password',
    RESET_PASSWORD: 'auth/reset-password',
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
  LEAVE: {
    LIST: 'leave',
    APPLY: 'leave/apply',
    FORCE: 'leave/force',
    APPROVAL_ACTION: 'leave/approval',
  },
  SETTINGS: {
    PERMISSION: {
      SYSTEM: {
        ADD: 'permissions',
        LIST: 'permissions',
        UPDATE: 'permissions',
        DELETE: 'permissions/bulk',
      },
      ROLE: {
        LIST: 'role',
        ADD: 'role',
        UPDATE: 'role',
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
        DELETE: 'user-permissions/bulk',
      },
    },
  },
} as const;

/**
 * API endpoints that should skip authentication
 */
export const SKIP_AUTH_ENDPOINTS = [
  API_ROUTES.AUTH.LOGIN,
  API_ROUTES.AUTH.FORGOT_PASSWORD,
  API_ROUTES.AUTH.RESET_PASSWORD,
] as const;
