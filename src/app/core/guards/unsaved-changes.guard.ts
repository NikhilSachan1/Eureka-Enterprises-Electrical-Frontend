import { inject } from '@angular/core';
import { CanDeactivateFn, Route, Routes } from '@angular/router';
import { UnsavedChangesService } from '@core/services/unsaved-changes.service';
import { IUnsavedChangesAware, TLoadChildrenResult } from '@core/types';
import { ROUTE_BASE_PATHS } from '@shared/constants';
import { isObservable, map } from 'rxjs';

function isUnsavedChangesAware(value: unknown): value is IUnsavedChangesAware {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as IUnsavedChangesAware).hasUnsavedChanges === 'function'
  );
}

/**
 * Asks before leaving a page whose form has unsaved input. Pages opt in by having
 * `hasUnsavedChanges()` (every FormBase page does); other pages pass straight through.
 */
export const unsavedChangesGuard: CanDeactivateFn<unknown> = (
  component,
  _currentRoute,
  _currentState,
  nextState
) => {
  if (!isUnsavedChangesAware(component) || !component.hasUnsavedChanges()) {
    return true;
  }

  // Logout and session expiry go to /auth: never hold the user on a page they can't save from.
  if (nextState?.url.startsWith(`/${ROUTE_BASE_PATHS.AUTH}`)) {
    return true;
  }

  return inject(UnsavedChangesService).confirmDiscard();
};

function wrapLoaded(loaded: unknown): unknown {
  if (Array.isArray(loaded)) {
    return withUnsavedChangesGuard(loaded as Routes);
  }

  const defaultExport = (loaded as { default?: unknown } | null)?.default;
  if (Array.isArray(defaultExport)) {
    return { default: withUnsavedChangesGuard(defaultExport as Routes) };
  }

  return loaded;
}

/**
 * Adds `unsavedChangesGuard` to every page in a route tree, including lazy-loaded
 * children, so no feature has to remember to add it.
 */
export function withUnsavedChangesGuard(routes: Routes): Routes {
  return routes.map((route): Route => {
    const next: Route = { ...route };

    if (route.component || route.loadComponent) {
      next.canDeactivate = [
        ...(route.canDeactivate ?? []),
        unsavedChangesGuard,
      ];
    }

    if (route.children) {
      next.children = withUnsavedChangesGuard(route.children);
    }

    const { loadChildren } = route;
    if (loadChildren) {
      next.loadChildren = (): TLoadChildrenResult => {
        const result = loadChildren();

        if (isObservable(result)) {
          return result.pipe(map(wrapLoaded)) as TLoadChildrenResult;
        }

        return Promise.resolve(result).then(wrapLoaded) as TLoadChildrenResult;
      };
    }

    return next;
  });
}
