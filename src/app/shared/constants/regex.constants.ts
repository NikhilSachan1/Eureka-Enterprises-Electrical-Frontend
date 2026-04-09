/**
 * Preset **global** strip patterns for `textConfig.regex`.
 * Each regex matches characters removed from the value (`String#replace`).
 */
export const TEXT_INPUT_ACCEPT_STRIP = {
  DIGITS: /\D/g,
  ALPHANUMERIC_WITH_SPACES: /[^a-zA-Z0-9\s]/g,
  ALPHABETS_WITH_SPACES: /[^a-zA-Z\s]/g,
  ALPHANUMERIC: /[^a-zA-Z0-9]/g,
} as const;

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
