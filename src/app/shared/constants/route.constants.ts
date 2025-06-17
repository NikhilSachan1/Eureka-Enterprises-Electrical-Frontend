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
  CARD: 'card',
  VEHICLE: 'vehicle',
  PAYROLL: 'payroll',
  DASHBOARD: 'dashboard',
  SITE: {
    BASE: 'site',
    COMPANY: 'company',
    CONTRACTOR: 'contractor',
    PROJECT: 'project'
  }
} as const;

export const ROUTES = {

  AUTH: {
    LOGIN: 'login',
    REGISTER: 'register',
    FORGOT_PASSWORD: 'forgot-password',
    RESET_PASSWORD: 'reset-password'
  },

  EMPLOYEE: {
    LIST: `list`,
    ADD: `add`,
    EDIT: `edit/:id`
  },

  ATTENDANCE: {
    LIST: `list`,
    APPLY: `apply`,
    FORCE: `force`
  },

  EXPENSE: {
    LEDGER: `ledger`,
    FORCE: `force`,
    ADD: `add`,
    EDIT: `edit/:id`,
    REIMBURSEMENT: `reimbursement`
  },

  FUEL: {
    LEDGER: `ledger`,
    FORCE: `force`,
    ADD: `add`,
    REIMBURSEMENT: `reimbursement`,
    EDIT: `edit/:id`
  },

  LEAVE: {
    APPLY: `apply`,
    LIST: `list`,
    FORCE: `force`
  },

  SITE: {
    CONTRACTOR: {
      LIST: `list`,
      ADD: `add`,
    },
    COMPANY: {
      LIST: `list`,
      ADD: `add`,
    },
    PROJECT: {
      LIST: `list`,
      ADD: `add`,
    }
  },

  CALENDAR: {
    LIST: `list`,
    ADD: `add`,
    EDIT: `edit/:id`
  },

  ASSET: {
    LIST: `list`,
    ADD: `add`,
    EDIT: `edit/:id`
  },

  CARD: {
    LIST: `list`,
    ADD: `add`,
    EDIT: `edit/:id`,
    RECHARGE_HISTORY: `recharge-history`,
    ADD_RECHARGE: `add-recharge`
  },

  VEHICLE: {
    LIST: `list`,
    ADD: `add`,
    EDIT: `edit/:id`
  },

  PAYROLL: {
    PAYSLIP: `payslip`,
    INCREMENT: `increment`,
    MONTHLY_REPORT: `monthly-report`,
    STRUCTURE: `structure`
  }
} as const; 