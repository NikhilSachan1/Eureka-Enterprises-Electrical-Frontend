import { ETableActionTypeValue } from '../data-table/data-table.types';

export enum EEntrySourceType {
  WEB = 'web',
  MOBILE = 'mobile',
  SYSTEM = 'system',
}

export enum EEntryType {
  REGULARIZED = 'regularized',
  SELF = 'self',
  FORCED = 'forced',
  SYSTEM = 'system',
}

export enum EApprovalStatus {
  PENDING = 'pending',
  APPROVED = ETableActionTypeValue.APPROVED,
  REJECTED = ETableActionTypeValue.REJECTED,
  CANCELLED = ETableActionTypeValue.CANCELLED,
}
