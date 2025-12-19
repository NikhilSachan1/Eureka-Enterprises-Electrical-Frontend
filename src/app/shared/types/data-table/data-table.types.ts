export enum ETableActionTypeValue {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
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
