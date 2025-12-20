export const REGEX = {
  // Alphabets
  ALPHABETS_ONLY: /^[a-zA-Z]*$/,
  ALPHABETS_WITH_SPACES: /^[a-zA-Z\s]*$/,

  // Alphanumeric
  ALPHANUMERIC: /^[a-zA-Z0-9]*$/,
  ALPHANUMERIC_WITH_SPACES: /^[a-zA-Z0-9\s]*$/,

  // Email
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  // Phone
  PHONE: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,

  // Special rules
  NO_SPECIAL_CHARS: /^[a-zA-Z0-9\s]*$/,
  NO_SPACES: /^\S*$/,

  // Indian formats
  PAN_CARD: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
  AADHAAR: /^[0-9]{12}$/,
  IFSC_CODE: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  PIN_CODE: /^[1-9][0-9]{5}$/,
} as const;
