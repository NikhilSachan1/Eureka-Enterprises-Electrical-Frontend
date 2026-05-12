export const FORM_VALIDATION_MESSAGES = {
  FORM_INVALID: 'Please fill form correctly and try submitting again',
  SUBMISSION_ERROR: 'An unexpected error occurred. Please try again',
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
} as const;

/** Must stay in sync with `InputFieldComponent` placeholder-row value (city/state pattern). */
export const DROPDOWN_DISABLED_PLACEHOLDER_ROW_VALUE = '__ee_dropdown_hint__';
