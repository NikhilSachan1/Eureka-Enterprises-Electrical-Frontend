export const AUTH_MESSAGES = {
  LOADING: {
    LOGIN: 'Logging In',
    SETUP_WORKSPACE: 'Setting Up Your Workspace',
    FORGOT_PASSWORD: 'Forgot Password',
    RESET_PASSWORD: 'Reset Password',
  },
  LOADING_MESSAGES: {
    LOGIN: 'Please wait while we verify your credentials...',
    SETUP_WORKSPACE: 'Please wait while we set up your workspace...',
    FORGOT_PASSWORD: 'Please wait while we send you a reset password link...',
    RESET_PASSWORD: 'Please wait while we reset your password...',
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
