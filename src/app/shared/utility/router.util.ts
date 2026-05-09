import { ActivatedRoute } from '@angular/router';

/**
 * Walks `route` → parents and returns the first non-empty path param value.
 */
export function getParamFromRouteAncestors(
  route: ActivatedRoute,
  paramName: string
): string | undefined {
  let r: ActivatedRoute | null = route;
  while (r) {
    const value = r.snapshot.paramMap.get(paramName);
    if (value) {
      return value;
    }
    r = r.parent;
  }
  return undefined;
}

/**
 * Walks `route` → parents and returns the first route `data[key]` that is present
 * (key exists on `data`, including `null` / `false` values).
 */
export function getRouteDataFromAncestors<T = unknown>(
  route: ActivatedRoute,
  dataKey: string
): T | undefined {
  let r: ActivatedRoute | null = route;
  while (r) {
    const data = r.snapshot.data as Record<string, unknown>;
    if (Object.prototype.hasOwnProperty.call(data, dataKey)) {
      return data[dataKey] as T;
    }
    r = r.parent;
  }
  return undefined;
}
