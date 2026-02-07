/**
 * Route constants used throughout the application
 */

export const ROUTE_BASE_PATHS = {
  AUTH: 'auth',
  EMPLOYEE: 'employee',
  ATTENDANCE: 'attendance',
  EXPENSE: 'expense',
  FUEL: 'fuel',
  LEAVE: 'leave',
  CALENDAR: 'calendar',
  ASSET: 'asset',
  VEHICLE: 'vehicle',
  VEHICLE_SERVICE: 'service',
  PAYROLL: 'payroll',
  DASHBOARD: 'dashboard',
  PETRO_CARD: 'petro-card',
  TRANSPORT: 'transport',
  ANNOUNCEMENT: 'announcement',
  SITE: {
    BASE: 'site',
    COMPANY: 'company',
    CONTRACTOR: 'contractor',
    PROJECT: 'project',
  },
  SETTINGS: {
    BASE: 'settings',
    PERMISSION: {
      BASE: 'permission',
      SYSTEM: 'system',
      USER: 'user',
      ROLE: 'role',
      ROLE_PERMISSION: 'role-permission',
      USER_PERMISSION: 'user-permission',
    },
  },
} as const;

export const ROUTES = {
  AUTH: {
    LOGIN: 'login',
    FORGOT_PASSWORD: 'forgot-password',
    RESET_PASSWORD: 'reset-password',
  },

  EMPLOYEE: {
    LIST: `list`,
    ADD: `add`,
    EDIT: `edit`,
    MY_PROFILE: 'my-profile',
  },

  ATTENDANCE: {
    LIST: `list`,
    APPLY: `apply`,
    FORCE: `force`,
  },

  EXPENSE: {
    LEDGER: `ledger`,
    FORCE: `force`,
    ADD: `add`,
    EDIT: `edit`,
    REIMBURSE: `reimburse`,
  },

  FUEL: {
    LEDGER: `ledger`,
    FORCE: `force`,
    ADD: `add`,
    REIMBURSEMENT: `reimbursement`,
    EDIT: `edit`,
  },

  LEAVE: {
    APPLY: `apply`,
    LIST: `list`,
    FORCE: `force`,
  },

  SITE: {
    CONTRACTOR: {
      LIST: `list`,
      ADD: `add`,
      EDIT: `edit`,
    },
    COMPANY: {
      LIST: `list`,
      ADD: `add`,
      EDIT: `edit`,
    },
    PROJECT: {
      LIST: `list`,
      ADD: `add`,
      EDIT: `edit`,
      ANALYSIS: `analysis`,
    },
  },

  CALENDAR: {
    LIST: `list`,
    ADD: `add`,
    EDIT: `edit`,
  },

  ASSET: {
    LIST: `list`,
    ADD: `add`,
    EDIT: `edit`,
    EVENT_HISTORY: `event-history`,
  },

  CARD: {
    LIST: `list`,
    ADD: `add`,
    EDIT: `edit`,
    RECHARGE_HISTORY: `recharge-history`,
    ADD_RECHARGE: `add-recharge`,
  },

  VEHICLE: {
    LIST: `list`,
    ADD: `add`,
    EDIT: `edit`,
    EVENT_HISTORY: `event-history`,
  },

  VEHICLE_SERVICE: {
    LIST: `list`,
    ADD: `add`,
    EDIT: `edit`,
  },
  ANNOUNCEMENT: {
    LIST: `list`,
    ADD: `add`,
    EDIT: `edit`,
    SHOW: `show`,
  },

  PAYROLL: {
    PAYSLIP: `payslip`,
    INCREMENT: `increment`,
    MONTHLY_REPORT: `monthly-report`,
    STRUCTURE: `structure`,
  },
  PETRO_CARD: {
    LIST: `list`,
    ADD: `add`,
    EDIT: `edit`,
  },

  SETTINGS: {
    PERMISSION: {
      SYSTEM: {
        LIST: `list`,
        ADD: `add`,
        EDIT: `edit`,
      },
      USER: {
        LIST: `list`,
        ADD: `add`,
        EDIT: `edit`,
      },
      ROLE: {
        LIST: `list`,
        ADD: `add`,
        EDIT: `edit`,
      },
      ROLE_PERMISSION: {
        SET_PERMISSIONS: `set-permissions`,
      },
      USER_PERMISSION: {
        SET_PERMISSIONS: `set-permissions`,
      },
    },
  },
} as const;
