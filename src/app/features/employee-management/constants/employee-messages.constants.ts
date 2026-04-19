export const EMPLOYEE_MESSAGES = {
  LOADING: {
    ADD: 'Adding employee',
    EDIT: 'Updating employee',
    DELETE: 'Deleting employee',
    CHANGE_STATUS: 'Updating employee status',
    SEND_PASSWORD_LINK: 'Sending password setup link',
    GET_LIST: 'Loading employees',
    GET_DETAIL: 'Loading employee details',
    GET_PROFILE: 'Loading your profile',
    GET_NEXT_ID: 'Preparing employee code',
  },
  LOADING_MESSAGES: {
    ADD: "We're adding this employee. This will just take a moment.",
    EDIT: "We're updating your changes. This will just take a moment.",
    DELETE: "We're removing this employee. This will just take a moment.",
    CHANGE_STATUS:
      "We're updating this employee's status. This will just take a moment.",
    SEND_PASSWORD_LINK:
      "We're sending the password setup link. This will just take a moment.",
    GET_LIST: "We're loading employees. This will just take a moment.",
    GET_DETAIL: "We're loading employee details. This will just take a moment.",
    GET_PROFILE: "We're loading your profile. This will just take a moment.",
    GET_NEXT_ID:
      "We're preparing the next employee code. This will just take a moment.",
  },
  SUCCESS: {
    ADD: 'Employee added successfully',
    EDIT: 'Employee updated successfully',
    DELETE: 'Employee deleted successfully',
    CHANGE_STATUS: 'Employee status changed successfully',
    SEND_PASSWORD_LINK: 'Password link sent successfully',
    EMAIL_UPDATED_LOGOUT:
      'Your email has been updated. Please log in again with your new email.',
  },
  ERROR: {
    ADD: 'Failed to add employee',
    EDIT: 'Failed to update employee',
    DELETE: 'Failed to delete employee',
    CHANGE_STATUS: 'Failed to change employee status',
    SEND_PASSWORD_LINK: 'Failed to send password link',
    GET_LIST: 'Failed to load employee list',
    GET_DETAIL: 'Failed to load employee details',
    GET_PROFILE: 'Failed to load profile',
    NETWORK_ERROR: 'Network error occurred. Please try again.',
    VALIDATION_ERROR: 'Please check the form for errors',
    UNKNOWN_ERROR: 'An unexpected error occurred',
  },
  VALIDATION: {
    RECORD_REQUIRED: 'Selected record is required',
    EMPLOYEE_ID_REQUIRED: 'Employee ID is required',
    FORM_INVALID: 'Please fill all required fields correctly',
  },
} as const;
