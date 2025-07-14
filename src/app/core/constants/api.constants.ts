export const API_ROUTES = {
    AUTH: {
        LOGIN: 'auth/sign-in',
        FORGOT_PASSWORD: 'auth/forget-password',
        RESET_PASSWORD: 'auth/reset-password',
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
                PERMISSION_LIST: 'role-permissions',
                DELETE: 'role/bulk',
                SET_PERMISSION: 'role-permissions/bulk',
            }
        }
    }
} as const;

/**
 * API endpoints that should skip authentication
 */
export const SKIP_AUTH_ENDPOINTS = [
    API_ROUTES.AUTH.LOGIN,
    API_ROUTES.AUTH.FORGOT_PASSWORD,
    API_ROUTES.AUTH.RESET_PASSWORD,
] as const;
