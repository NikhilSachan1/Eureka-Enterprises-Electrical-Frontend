import {
  IConfigObjectEntry,
  IConfigValueNode,
} from '../types/config-value-node.model';
import { TConfigurationValueKind } from '../types/configuration.types';

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
    value === 'object' ||
    value === 'array'
  );
}

export function serializeConfigValue(node: IConfigValueNode): unknown {
  switch (node.kind) {
    case 'string':
      return node.stringValue ?? '';
    case 'number':
      return node.numberValue ?? 0;
    case 'boolean':
      return node.boolValue ?? false;
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
