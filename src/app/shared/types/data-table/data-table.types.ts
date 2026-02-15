export enum ETableActionTypeValue {
  PAID = 'PAID',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  HANDOVER_INITIATED = 'HANDOVER_INITIATED',
  HANDOVER_ACCEPTED = 'HANDOVER_ACCEPTED',
  HANDOVER_REJECTED = 'HANDOVER_REJECTED',
  HANDOVER_CANCELLED = 'HANDOVER_CANCELLED',
  DEALLOCATED = 'DEALLOCATED',
  SET_PERMISSIONS = 'SET_PERMISSIONS',
}

export enum ETableFilterDisplayType {
  MENU = 'menu',
  CHIP = 'chip',
}

export enum ETableFilterOperator {
  AND = 'and',
  OR = 'or',
}

export enum ETableFilterMatchMode {
  EQUALS = 'equals',
  CONTAINS = 'contains',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
  IN = 'in',
  ANY = 'any',
  BETWEEN = 'between',
}
