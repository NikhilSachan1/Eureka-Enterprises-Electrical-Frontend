import { APP_PERMISSION } from '@core/constants/app-permission.constant';

type HandoverScopeKind = 'asset' | 'vehicle';
type HandoverScope = 'MY' | 'ALL' | 'PENDING';

type PermissionCheck = (permission: string) => boolean;

const SCOPE_ORDER: readonly HandoverScope[] = ['MY', 'ALL', 'PENDING'];

function permissionsOf(kind: HandoverScopeKind): {
  handoverResponse: string[];
  returnResponse: string[];
} {
  const module =
    kind === 'asset' ? APP_PERMISSION.ASSET : APP_PERMISSION.VEHICLE;
  return {
    handoverResponse: [module.HANDOVER_ACCEPTED, module.HANDOVER_REJECTED],
    returnResponse: [module.RETURN_ACCEPTED, module.RETURN_REJECTED],
  };
}

/** Office staff who may accept or reject a return to office. Returns wait on them. */
export function canRespondToReturns(
  kind: HandoverScopeKind,
  hasPermission: PermissionCheck
): boolean {
  return permissionsOf(kind).returnResponse.some(hasPermission);
}

/**
 * Whether a user sees the My / All / Pending tabs on the asset or vehicle list. They come as a set:
 * anyone who may accept or reject a handover or a return gets all three (Pending holds what waits on
 * them), everyone else gets no tab bar and just the full list. The lists and every dashboard link
 * that opens them by tab index ask this one function, so they always agree.
 */
export function canSeeHandoverScopeTabs(
  kind: HandoverScopeKind,
  hasPermission: PermissionCheck
): boolean {
  const { handoverResponse, returnResponse } = permissionsOf(kind);
  return [...handoverResponse, ...returnResponse].some(hasPermission);
}

/** `?tab=` for a link that should open `scope`, or undefined when the user has no tab bar. */
export function handoverScopeTabQuery(
  kind: HandoverScopeKind,
  scope: HandoverScope,
  hasPermission: PermissionCheck
): { tab: string } | undefined {
  return canSeeHandoverScopeTabs(kind, hasPermission)
    ? { tab: String(SCOPE_ORDER.indexOf(scope)) }
    : undefined;
}
