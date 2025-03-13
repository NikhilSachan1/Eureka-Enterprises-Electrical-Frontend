export const PERMISSIONS = {
    USERS: {
        CREATE: 'users.create',
        DELETE: 'users.delete',
        VIEW: 'users.view',
        UPDATE: 'users.update'
    },
    EXPENSES: {
        CREATE: 'expenses.create',
        DELETE: 'expenses.delete',
        VIEW: 'expenses.view',
        UPDATE: 'expenses.update'
    },
} as const;

export type PermissionType = (typeof PERMISSIONS)[keyof typeof PERMISSIONS][keyof (typeof PERMISSIONS)[keyof typeof PERMISSIONS]];
