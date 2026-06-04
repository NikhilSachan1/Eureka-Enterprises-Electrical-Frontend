/**
 * Preset **global** strip patterns for `textConfig.regex`.
 * Each regex matches characters removed from the value (`String#replace`).
 */
export const TEXT_INPUT_ACCEPT_STRIP = {
  DIGITS: /\D/g,
  ALPHANUMERIC_WITH_SPACES: /[^a-zA-Z0-9\s]/g,
  /**
   * House, block, street, landmark, etc.
   * Allows letters, digits, spaces, and common address punctuation (`,` `.` `/` `-` `'` `#` `()` `&`).
   */
  ADDRESS: /[^a-zA-Z0-9\s,./#()&'-]/g,
  ALPHABETS_WITH_SPACES: /[^a-zA-Z\s]/g,
  ALPHANUMERIC: /[^a-zA-Z0-9]/g,
  /** Block/plot numbers (e.g. A-101, 12/34, Wing A, Block 2). */
  ALPHANUMERIC_WITH_SLASH_AND_HYPHEN: /[^a-zA-Z0-9/\-,]/g,
  /** House/flat numbers with spaces (e.g. FLAT 12 A, 12/34, 42-A). */
  ALPHANUMERIC_WITH_SLASH_HYPHEN_AND_SPACES: /[^a-zA-Z0-9\s/\-,]/g,
  ALPHANUMERIC_WITH_SPECIAL_CHARS:
    /[^a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};:'",.<>/?]/g,
} as const;

/** Indian GSTIN length (15 characters). */
export const GST_NUMBER_LENGTH = 15;

/** Regex for `Validators.pattern` and other validation (not input strip). */
export const FORM_VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
} as const;

/**
 * Same logical test as strip, without `g`, for `.test()` on one key or `beforeinput` `e.data`
 * (avoids `lastIndex` issues on global regexes).
 */
export function invalidCharsPatternFromStrip(strip: RegExp): RegExp {
  return new RegExp(strip.source, strip.flags.replace(/g/g, ''));
}
