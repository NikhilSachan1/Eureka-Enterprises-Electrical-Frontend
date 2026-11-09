import { APP_PERMISSION } from '@core/constants/app-permission.constant';

export type HandoverScopeKind = 'asset' | 'vehicle';
export type HandoverScope = 'MY' | 'ALL' | 'PENDING';

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
 * Which list tabs (My / All / Pending) a user sees for assets or vehicles. The lists and every
 * dashboard link that opens them by tab index must agree, so they all ask this one function.
 *
 * - My and Pending: anyone who may accept or reject a handover or a return. Pending holds what
 *   waits on them: handovers sent to them and, for return responders, returns to office.
 * - All: shown next to them. A user with neither sees no tab bar, just the full list.
 */
export function canSeeHandoverScopeTab(
  kind: HandoverScopeKind,
  scope: HandoverScope,
  hasPermission: PermissionCheck
): boolean {
  const { handoverResponse, returnResponse } = permissionsOf(kind);
  const respondsToRequests = [...handoverResponse, ...returnResponse].some(
    hasPermission
  );

  // All only matters as a tab beside My / Pending, so all three share one rule.
  return SCOPE_ORDER.includes(scope) && respondsToRequests;
}

/** `?tab=` for a link that should open `scope`, or undefined when the user does not see that tab. */
export function handoverScopeTabQuery(
  kind: HandoverScopeKind,
  scope: HandoverScope,
  hasPermission: PermissionCheck
): { tab: string } | undefined {
  const visible = SCOPE_ORDER.filter(s =>
    canSeeHandoverScopeTab(kind, s, hasPermission)
  );
  const index = visible.indexOf(scope);
  return index < 0 ? undefined : { tab: String(index) };
}
