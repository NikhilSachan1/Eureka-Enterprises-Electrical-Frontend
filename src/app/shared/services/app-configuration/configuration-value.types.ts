/**
 * A single-value backend configuration (text / number / boolean / json), read the same lazy,
 * batched, cached way as the dropdown configurations. Declare it once with
 * `defineConfigurationValue(...)` and read it with `AppConfigurationService.configurationValue(...)`.
 */
export interface IConfigurationValueDefinition<T> {
  /** Configuration module, e.g. MODULE_NAMES.PAYMENTS. */
  moduleName: string;
  /** Configuration key, e.g. CONFIGURATION_KEYS.PAYMENTS.RECORD_MODE. */
  key: string;
  /** Used until the value loads, and when it is missing, unreadable or invalid. */
  fallback: T;
  /** Turns the raw active setting value into T; return null for an invalid value (→ fallback). */
  parse: (raw: unknown) => T | null;
}
