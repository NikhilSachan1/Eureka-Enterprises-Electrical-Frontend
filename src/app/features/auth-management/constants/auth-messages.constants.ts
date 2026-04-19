export const AUTH_MESSAGES = {
  LOADING: {
    LOGIN: 'Signing you in',
    SETUP_WORKSPACE: 'Setting up your workspace',
    FORGOT_PASSWORD: 'Sending reset link',
    RESET_PASSWORD: 'Resetting password',
  },
  LOADING_MESSAGES: {
    LOGIN: "We're verifying your credentials. This will just take a moment.",
    SETUP_WORKSPACE:
      "We're setting up your workspace. This will just take a moment.",
    FORGOT_PASSWORD:
      "We're sending a password reset link. This will just take a moment.",
    RESET_PASSWORD:
      "We're resetting your password. This will just take a moment.",
  },
  SUCCESS: {
    LOGIN_WITH_ROLE: (roleName: string) =>
      `Welcome! You're now logged in as ${roleName}`,
  },
  ERROR: {
    LOGIN: 'Login failed',
    FORGOT_PASSWORD: 'Failed to send password reset link',
    RESET_PASSWORD: 'Failed to reset password',
    LOAD_APP_DATA: 'Failed to load app data',
  },
} as const;
