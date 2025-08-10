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
} as const;
