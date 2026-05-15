export const API_ROUTES = {
  DASHBOARD: {
    APPROVAL_PENDING: 'dashboard/approvals',
    LEDGER_BALANCES: 'dashboard/ledger-balances',
    ASSET_FLEET_ALERTS: 'dashboard/alerts',
    VEHICLE_READINGS_ALERTS: 'dashboard/vehicle-readings',
    BIRTHDAYS: 'dashboard/birthdays',
    ANNIVERSARIES: 'dashboard/anniversaries',
    HOLIDAYS: 'dashboard/festivals',
  },
  HEALTH: {
    CHECK: 'health-check',
  },
  CRON: {
    GET_JOBS: 'admin/cron/jobs',
    RUN_JOB: 'admin/cron/trigger',
  },
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
    FINANCIAL_UPLOAD: 'files/financial-upload',
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
    BALANCE: 'leave-balances',
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
    FORCE: 'vehicle-logs',
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
      LIST: 'configurations/details',
      ADD: 'configurations/with-settings',
      EDIT: (configurationId: string) => `configurations/${configurationId}`,
      GET_CONFIGURATION_BY_ID: (configurationId: string) =>
        `configurations/${configurationId}`,
    },
  },
  SITE: {
    TIMELINE: {
      GET: (siteId: string) => `analytics/sites/${siteId}/timeline`,
    },
    PROFITABILITY: {
      GET: (siteId: string) => `analytics/sites/${siteId}/profitability`,
    },
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
    VENDOR: {
      LIST: 'vendors',
      ADD: 'vendors',
      DELETE: 'vendors',
      EDIT: (vendorId: string) => `vendors/${vendorId}`,
      GET_VENDOR_BY_ID: (vendorId: string) => `vendors/${vendorId}`,
    },
    PROJECT: {
      LIST: 'sites',
      ADD: 'sites',
      DELETE: 'sites',
      EDIT: (projectId: string) => `sites/${projectId}`,
      GET_PROJECT_BY_ID: (projectId: string) => `sites/${projectId}`,
      CHANGE_STATUS: (projectId: string) => `sites/${projectId}/status`,
      ALLOCATE_DEALLOCATE_EMPLOYEES: 'site-allocations/manage',
    },
    DSR: {
      ADD: 'daily-status-reports',
      EDIT: (dsrId: string) => `daily-status-reports/${dsrId}`,
      DELETE: (dsrId: string) => `daily-status-reports/${dsrId}`,
      LIST: 'daily-status-reports',
      GET_DSR_BY_ID: (dsrId: string) =>
        `daily-status-reports/${dsrId}/versions`,
    },
    DOCUMENT: {
      PO: {
        ADD: 'purchase-orders',
        EDIT: (poId: string) => `purchase-orders/${poId}`,
        LIST: 'purchase-orders',
        DROPDOWN: 'purchase-orders/dropdown',
        GET_PO_BY_ID: (poId: string) => `purchase-orders/${poId}`,
        APPROVE: (poId: string) => `purchase-orders/${poId}/approve`,
        REJECT: (poId: string) => `purchase-orders/${poId}/reject`,
        UNLOCK_REQUEST: (poId: string) =>
          `purchase-orders/${poId}/unlock-request`,
        UNLOCK_REQUEST_GRANT: (poId: string) =>
          `purchase-orders/${poId}/unlock-grant`,
        UNLOCK_REQUEST_REJECT: (poId: string) =>
          `purchase-orders/${poId}/unlock-reject`,
        DELETE: (poId: string) => `purchase-orders/${poId}`,
      },
      JMC: {
        ADD: 'jmcs',
        EDIT: (jmcId: string) => `jmcs/${jmcId}`,
        LIST: 'jmcs',
        DROPDOWN: 'jmcs/dropdown',
        GET_JMC_BY_ID: (jmcId: string) => `jmcs/${jmcId}`,
        APPROVE: (jmcId: string) => `jmcs/${jmcId}/approve`,
        REJECT: (jmcId: string) => `jmcs/${jmcId}/reject`,
        UNLOCK_REQUEST: (jmcId: string) => `jmcs/${jmcId}/unlock-request`,
        UNLOCK_REQUEST_GRANT: (jmcId: string) => `jmcs/${jmcId}/unlock-grant`,
        UNLOCK_REQUEST_REJECT: (jmcId: string) => `jmcs/${jmcId}/unlock-reject`,
        DELETE: (jmcId: string) => `jmcs/${jmcId}`,
      },
      REPORT: {
        ADD: 'site-reports',
        EDIT: (reportId: string) => `site-reports/${reportId}`,
        LIST: 'site-reports',
        GET_REPORT_BY_ID: (reportId: string) => `site-reports/${reportId}`,
        DELETE: (reportId: string) => `site-reports/${reportId}`,
      },
      INVOICE: {
        ADD: 'site-invoices',
        EDIT: (invoiceId: string) => `site-invoices/${invoiceId}`,
        LIST: 'site-invoices',
        GET_INVOICE_BY_ID: (invoiceId: string) => `site-invoices/${invoiceId}`,
        APPROVE: (invoiceId: string) => `site-invoices/${invoiceId}/approve`,
        REJECT: (invoiceId: string) => `site-invoices/${invoiceId}/reject`,
        UNLOCK_REQUEST: (invoiceId: string) =>
          `site-invoices/${invoiceId}/unlock-request`,
        UNLOCK_REQUEST_GRANT: (invoiceId: string) =>
          `site-invoices/${invoiceId}/unlock-grant`,
        UNLOCK_REQUEST_REJECT: (invoiceId: string) =>
          `site-invoices/${invoiceId}/unlock-reject`,
        DELETE: (invoiceId: string) => `site-invoices/${invoiceId}`,
      },
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

/**
 * Relative paths passed to {@link ApiService} `get` / `getValidated` / `getBlob` for which
 * global HTTP error toasts are suppressed (bootstrap, permissions, configuration details,
 * reference lists / lazy dropdown data). Exact match on the `endpoint` argument.
 * POST/PUT/PATCH/DELETE are unaffected unless they pass explicit `silent` in options.
 */
export const GET_ENDPOINT_PATHS_WITHOUT_ERROR_TOAST = new Set<string>([
  API_ROUTES.HEALTH.CHECK,
  API_ROUTES.SETTINGS.CONFIGURATION.LIST,
  API_ROUTES.SETTINGS.PERMISSION.ROLE.LIST,
  API_ROUTES.SETTINGS.PERMISSION.USER.LIST,
  API_ROUTES.SETTINGS.PERMISSION.USER_PERMISSION.LIST,
  API_ROUTES.EMPLOYEE.LIST,
  API_ROUTES.ASSET.LIST,
  API_ROUTES.VEHICLE.LIST,
  API_ROUTES.VEHICLE.GET_LINKED_USER_VEHICLE_DETAIL,
  API_ROUTES.PETRO_CARD.LIST,
  API_ROUTES.SITE.COMPANY.LIST,
  API_ROUTES.SITE.CONTRACTOR.LIST,
  API_ROUTES.SITE.VENDOR.LIST,
]);

export const SKIP_AUTH_ENDPOINTS = [
  API_ROUTES.AUTH.LOGIN,
  API_ROUTES.AUTH.FORGOT_PASSWORD,
  API_ROUTES.AUTH.RESET_PASSWORD,
  API_ROUTES.AUTH.REFRESH_TOKEN,
] as const;
