import { inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IInputFieldsConfig } from '@shared/types';

export interface IHeaderFilterQueryParams {
  /** The value in the URL, or undefined when missing or not one of `allowed`. */
  read(key: string, allowed?: readonly string[]): string | undefined;
  /** Puts the values in the URL; undefined removes that key. */
  write(params: Record<string, string | undefined>): void;
}

/**
 * Keeps a list's page-header filters in the URL, so a refresh or a shared link opens the
 * same filtered list. Call from an injection context (field initializer / constructor).
 */
export function injectHeaderFilterQueryParams(): IHeaderFilterQueryParams {
  const router = inject(Router);
  const route = inject(ActivatedRoute);

  return {
    read(key, allowed): string | undefined {
      const value = route.snapshot.queryParamMap.get(key)?.trim();
      if (!value) {
        return undefined;
      }
      return !allowed || allowed.includes(value) ? value : undefined;
    },
    write(params): void {
      const queryParams = Object.fromEntries(
        Object.entries(params).map(([key, value]) => [key, value ?? null])
      );
      void router.navigate([], {
        relativeTo: route,
        queryParams,
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    },
  };
}

/** Values of a select field's fixed options, to check a value read from the URL. */
export function selectOptionValues(config: IInputFieldsConfig): string[] {
  const options = (
    config as { selectConfig?: { optionsDropdown?: { value: unknown }[] } }
  ).selectConfig?.optionsDropdown;
  return (options ?? []).map(option => String(option.value));
}
