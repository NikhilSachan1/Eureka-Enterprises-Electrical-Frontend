import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '@features/auth-management/services/auth.service';
import { RESTRICTED_ROLES_FOR_USER_ID } from '@shared/constants';

/**
 * Keys to strip from request body AND query params for restricted roles.
 * These roles should not be able to specify a target user —
 * the backend determines the user from the auth token instead.
 */
const KEYS_TO_STRIP: string[] = ['userId', 'userIds'];

/**
 * Interceptor that removes userId / userIds from both the request body
 * and query parameters when the active role is a restricted role (e.g. DRIVER).
 *
 * This prevents restricted roles from impersonating or targeting
 * another user through the request payload or query string.
 */
export const RolePayloadSanitizerInterceptor: HttpInterceptorFn = (
  req,
  next
) => {
  const authService = inject(AuthService);
  const activeRole = authService.user()?.activeRole ?? '';

  // Only sanitize if the active role is restricted
  if (!isRestrictedRole(activeRole)) {
    return next(req);
  }

  const sanitizedReq = sanitizeRequest(req);
  return next(sanitizedReq);
};

/* =========================
   HELPERS
   ========================= */

/**
 * Checks whether the active role is in the restricted list.
 */
function isRestrictedRole(role: string): boolean {
  return RESTRICTED_ROLES_FOR_USER_ID.includes(role);
}

/**
 * Strips userId / userIds from both query params and body.
 */
function sanitizeRequest(req: HttpRequest<unknown>): HttpRequest<unknown> {
  return stripFromBody(stripFromQueryParams(req));
}

/**
 * Removes matching keys from the URL query parameters.
 */
function stripFromQueryParams(req: HttpRequest<unknown>): HttpRequest<unknown> {
  let { params } = req;
  let changed = false;

  for (const key of KEYS_TO_STRIP) {
    if (params.has(key)) {
      params = params.delete(key);
      changed = true;
    }
  }

  return changed ? req.clone({ params }) : req;
}

/**
 * Removes matching keys from the request body (only for JSON object bodies).
 */
function stripFromBody(req: HttpRequest<unknown>): HttpRequest<unknown> {
  if (
    req.body === null ||
    typeof req.body !== 'object' ||
    Array.isArray(req.body)
  ) {
    return req;
  }

  const body = { ...(req.body as Record<string, unknown>) };
  let changed = false;

  for (const key of KEYS_TO_STRIP) {
    if (key in body) {
      delete body[key];
      changed = true;
    }
  }

  return changed ? req.clone({ body }) : req;
}
