import { IConfigurationValueDefinition } from './configuration-value.types';

/** Declares a single-value configuration; see IConfigurationValueDefinition. */
export function defineConfigurationValue<T>(
  definition: IConfigurationValueDefinition<T>
): IConfigurationValueDefinition<T> {
  return definition;
}

/** Text value that must be one of an enum's values (case-insensitive, trimmed). */
export function enumValueParser<T extends string>(
  enumObject: Record<string, T>
): (raw: unknown) => T | null {
  const allowed = Object.values(enumObject);
  return raw => {
    if (typeof raw !== 'string') {
      return null;
    }
    const normalized = raw.trim().toUpperCase();
    return allowed.find(value => value.toUpperCase() === normalized) ?? null;
  };
}

/** Any non-empty text value. */
export function textValueParser(raw: unknown): string | null {
  return typeof raw === 'string' && raw.trim().length > 0 ? raw.trim() : null;
}

/** A finite number (numeric strings accepted). */
export function numberValueParser(raw: unknown): number | null {
  const value = typeof raw === 'string' ? Number(raw.trim()) : raw;
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** true / false (also "true" / "false" text). */
export function booleanValueParser(raw: unknown): boolean | null {
  if (typeof raw === 'boolean') {
    return raw;
  }
  if (typeof raw === 'string') {
    const normalized = raw.trim().toLowerCase();
    if (normalized === 'true') {
      return true;
    }
    if (normalized === 'false') {
      return false;
    }
  }
  return null;
}
