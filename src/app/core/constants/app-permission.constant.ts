export const APP_PERMISSION = {
  DASHBOARD: 'view_dashboard',
  ATTENDANCE: {
    MODULE: 'module_attendance',
    APPLY: 'apply_attendance',
    FORCE: 'force_attendance',
    VIEW: 'view_attendance',
    VIEW_DETAIL: 'view_detail_attendance',
    REGULARIZE: 'regularize_attendance',
    APPROVE: 'approve_attendance',
    REJECT: 'reject_attendance',
  },
  SYSTEM_PERMISSION: {
    MODULE: 'module_system_permission',
    ADD: 'add_system_permission',
    EDIT: 'edit_system_permission',
    DELETE: 'delete_system_permission',
  },
  USER_PERMISSION: {
    MODULE: 'module_user_permission',
    DELETE: 'delete_user_permission',
    SET: 'set_permission_user',
  },
  ROLE_PERMISSION: {
    MODULE: 'module_role_permission',
    ADD: 'add_role_permission',
    EDIT: 'edit_role_permission',
    DELETE: 'delete_role_permission',
    SET: 'set_permission_role',
  },
  /**
   * Vehicle Management Permissions
   * Used for controlling visibility of columns, metrics, and search filters
   */
  VEHICLE: {
    MODULE: 'module_vehicle',
    VIEW: 'view_vehicle',
    ADD: 'add_vehicle',
    EDIT: 'edit_vehicle',
    DELETE: 'delete_vehicle',
    // Column visibility permissions
    VIEW_PETRO_CARD: 'view_vehicle_petro_card',
    VIEW_ASSIGNEE: 'view_vehicle_assignee',
    VIEW_INSURANCE_STATUS: 'view_vehicle_insurance_status',
    VIEW_PUC_STATUS: 'view_vehicle_puc_status',
    VIEW_FITNESS_STATUS: 'view_vehicle_fitness_status',
    VIEW_SERVICE_STATUS: 'view_vehicle_service_status',
    VIEW_ATTACHMENTS: 'view_vehicle_attachments',
    // Metric visibility permissions
    VIEW_TOTAL_METRIC: 'view_vehicle_total_metric',
    VIEW_ACTIVE_METRIC: 'view_vehicle_active_metric',
    VIEW_INACTIVE_METRIC: 'view_vehicle_inactive_metric',
    // Action permissions
    ALLOCATE: 'allocate_vehicle',
    DEALLOCATE: 'deallocate_vehicle',
    VIEW_HISTORY: 'view_vehicle_history',
    VIEW_SERVICE_HISTORY: 'view_vehicle_service_history',
  },
  /**
   * Employee Management Permissions
   */
  EMPLOYEE: {
    MODULE: 'module_employee',
    VIEW: 'view_employee',
    ADD: 'add_employee',
    EDIT: 'edit_employee',
    DELETE: 'delete_employee',
    VIEW_SALARY: 'view_employee_salary',
    VIEW_BANK_DETAILS: 'view_employee_bank_details',
    VIEW_DOCUMENTS: 'view_employee_documents',
  },
  /**
   * Expense Management Permissions
   */
  EXPENSE: {
    MODULE: 'module_expense',
    VIEW: 'view_expense',
    ADD: 'add_expense',
    EDIT: 'edit_expense',
    DELETE: 'delete_expense',
    APPROVE: 'approve_expense',
    REJECT: 'reject_expense',
    VIEW_AMOUNT: 'view_expense_amount',
  },

  UI: {
    SALARY_STRUCTURE: {
      TABLE: 'ui_table_salary_structure',
      CONTACT_ANNEXURE: 'ui_contact_annexure_salary_structure',
    },
    COMMON: {
      SIDEBAR_INITIALS: 'ui_common_sidebar_initials',
    },
  },
} as const;

export const UI_PERMISSIONS_ROLE_MAP = {
  SALARY_STRUCTURE: {
    TABLE: {
      ADMIN: true,
      DRIVER: false,
    },
    CONTACT_ANNEXURE: {
      ADMIN: false,
      DRIVER: true,
    },
  },
  COMMON: {
    SIDEBAR_INITIALS: {
      ADMIN: true,
      DRIVER: false,
    },
  },
} as const;
