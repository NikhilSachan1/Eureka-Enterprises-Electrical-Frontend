export const REGEX = {
  // Alphabets
  ALPHABETS_ONLY: /^[a-zA-Z]*$/,
  ALPHABETS_WITH_SPACES: /^[a-zA-Z\s]*$/,
  ALPHABETS_WITH_SINGLE_SPACE: /^[A-Za-z]+( [A-Za-z]+)?$/,

  // Alphanumeric
  ALPHANUMERIC: /^[a-zA-Z0-9]*$/,
  ALPHANUMERIC_WITH_SPACES: /^[a-zA-Z0-9\s]*$/,

  // Numbers
  NUMBER_ONLY: /^[0-9]*$/,

  // Email
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  // Special rules
  NO_SPECIAL_CHARS: /^[a-zA-Z0-9\s]*$/,
  NO_SPACES: /^\S*$/,

  // Indian formats
  PASSPORT: /^[A-Z][0-9]{7}$/,
  DL: /^[A-Z]{2}[\-]?\d{2}[\-]?\d{4}[\-]?\d{7}$/,
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
} as const;
