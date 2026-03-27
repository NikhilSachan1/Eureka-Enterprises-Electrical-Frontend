import {
  IConfigObjectEntry,
  IConfigValueNode,
} from '../types/config-value-node.model';
import { TConfigurationValueKind } from '../../types/configuration.types';

/**
 * Returns true when the value tree satisfies required-field rules (non-empty
 * primitives, non-blank object keys, recursively for nested object/array).
 */
export function isConfigValueNodeValid(node: IConfigValueNode): boolean {
  switch (node.kind) {
    case 'string':
      return (node.stringValue ?? '').trim() !== '';
    case 'number':
      return (
        node.numberValue !== undefined &&
        node.numberValue !== null &&
        !Number.isNaN(node.numberValue)
      );
    case 'boolean':
      return true;
    case 'date':
      return (
        node.dateValue instanceof Date &&
        !Number.isNaN(node.dateValue.getTime())
      );
    case 'object':
      return (node.objectEntries ?? []).every(
        e => (e.key ?? '').trim() !== '' && isConfigValueNodeValid(e.value)
      );
    case 'array':
      return (node.arrayItems ?? []).every(item =>
        isConfigValueNodeValid(item)
      );
    default:
      return true;
  }
}

export function createEmptyNode(
  kind: TConfigurationValueKind
): IConfigValueNode {
  switch (kind) {
    case 'string':
      return { kind: 'string', stringValue: '' };
    case 'number':
      return { kind: 'number', numberValue: undefined };
    case 'boolean':
      return { kind: 'boolean', boolValue: false };
    case 'date':
      return { kind: 'date', dateValue: undefined };
    case 'object':
      return {
        kind: 'object',
        objectEntries: [{ key: '', value: createEmptyNode('string') }],
      };
    case 'array':
      return {
        kind: 'array',
        arrayItems: [createEmptyNode('string')],
      };
    default:
      return { kind: 'string', stringValue: '' };
  }
}

/**
 * Maps backend / dropdown "configuration type" labels to an editor kind.
 */
export function mapConfigurationTypeToKind(
  raw: string | null | undefined
): TConfigurationValueKind {
  if (raw === null || raw === '') {
    return 'string';
  }
  const normalized = String(raw).trim().toLowerCase();
  if (['string', 'str', 'text'].includes(normalized)) {
    return 'string';
  }
  if (['number', 'integer', 'float', 'decimal', 'int'].includes(normalized)) {
    return 'number';
  }
  if (['boolean', 'bool'].includes(normalized)) {
    return 'boolean';
  }
  if (['date', 'datetime', 'date-time', 'timestamp'].includes(normalized)) {
    return 'date';
  }
  if (['object', 'map', 'json', 'record'].includes(normalized)) {
    return 'object';
  }
  if (['array', 'list'].includes(normalized)) {
    return 'array';
  }
  return 'string';
}

export function isTValueKind(value: unknown): value is TConfigurationValueKind {
  return (
    value === 'string' ||
    value === 'number' ||
    value === 'boolean' ||
    value === 'date' ||
    value === 'object' ||
    value === 'array'
  );
}

/** ISO date / datetime strings often used in JSON APIs. */
export function isLikelyIsoDateString(s: string): boolean {
  const t = s.trim();
  if (!t) {
    return false;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
    return !Number.isNaN(Date.parse(`${t}T00:00:00`));
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(t)) {
    return !Number.isNaN(Date.parse(t));
  }
  return false;
}

export function parseStringToDateValue(s: string): Date | null {
  const t = s.trim();
  if (!t) {
    return null;
  }
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Builds a value editor tree from API / JSON (used when editing existing configuration).
 */
export function parseUnknownToConfigValueNode(
  raw: unknown,
  valueTypeHint?: string | null
): IConfigValueNode {
  const kindFallback = mapConfigurationTypeToKind(valueTypeHint ?? undefined);

  if (raw === null || raw === undefined) {
    return createEmptyNode(kindFallback);
  }
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    return { kind: 'date', dateValue: raw };
  }
  if (typeof raw === 'string') {
    const hintKind = mapConfigurationTypeToKind(valueTypeHint ?? undefined);
    if (hintKind === 'date') {
      const d = parseStringToDateValue(raw);
      return {
        kind: 'date',
        dateValue: d ?? undefined,
      };
    }
    if (isLikelyIsoDateString(raw)) {
      const d = parseStringToDateValue(raw);
      if (d) {
        return { kind: 'date', dateValue: d };
      }
    }
    return { kind: 'string', stringValue: raw };
  }
  if (typeof raw === 'number' && !Number.isNaN(raw)) {
    return { kind: 'number', numberValue: raw };
  }
  if (typeof raw === 'boolean') {
    return { kind: 'boolean', boolValue: raw };
  }
  if (Array.isArray(raw)) {
    return {
      kind: 'array',
      arrayItems: raw.map(item => parseUnknownToConfigValueNode(item)),
    };
  }
  if (typeof raw === 'object') {
    const entries = Object.entries(raw as Record<string, unknown>).map(
      ([key, value]) => ({
        key,
        value: parseUnknownToConfigValueNode(value),
      })
    );
    return {
      kind: 'object',
      objectEntries:
        entries.length > 0
          ? entries
          : [{ key: '', value: createEmptyNode('string') }],
    };
  }
  return createEmptyNode(kindFallback);
}

export function serializeConfigValue(node: IConfigValueNode): unknown {
  switch (node.kind) {
    case 'string':
      return node.stringValue ?? '';
    case 'number':
      return node.numberValue ?? 0;
    case 'boolean':
      return node.boolValue ?? false;
    case 'date': {
      const dv = node.dateValue;
      if (dv instanceof Date && !Number.isNaN(dv.getTime())) {
        return dv.toISOString().split('T')[0];
      }
      return '';
    }
    case 'object': {
      const out: Record<string, unknown> = {};
      for (const e of node.objectEntries ?? []) {
        const k = (e.key ?? '').trim();
        if (k) {
          out[k] = serializeConfigValue(e.value);
        }
      }
      return out;
    }
    case 'array':
      return (node.arrayItems ?? []).map(item => serializeConfigValue(item));
    default:
      return node.stringValue ?? '';
  }
}

export function cloneObjectEntries(
  entries: IConfigObjectEntry[] | undefined
): IConfigObjectEntry[] {
  return (entries ?? []).map(e => ({
    key: e.key,
    value: cloneNode(e.value),
  }));
}

export function cloneNode(node: IConfigValueNode): IConfigValueNode {
  switch (node.kind) {
    case 'string':
      return { ...node };
    case 'number':
      return { ...node };
    case 'boolean':
      return { ...node };
    case 'date':
      return { ...node };
    case 'object':
      return {
        kind: 'object',
        objectEntries: cloneObjectEntries(node.objectEntries),
      };
    case 'array':
      return {
        kind: 'array',
        arrayItems: (node.arrayItems ?? []).map(cloneNode),
      };
    default:
      return { ...node };
  }
}
