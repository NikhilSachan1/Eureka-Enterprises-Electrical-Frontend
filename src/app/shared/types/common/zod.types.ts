import { ETableActionTypeValue } from '../data-table/data-table.types';

export enum EEntrySourceType {
  WEB = 'web',
  MOBILE = 'mobile',
}

export enum EEntryType {
  REGULARIZED = 'regularized',
  SELF = 'self',
  FORCED = 'forced',
}

export enum EApprovalStatus {
  PENDING = 'pending',
  APPROVED = ETableActionTypeValue.APPROVED,
  REJECTED = ETableActionTypeValue.REJECTED,
  CANCELLED = ETableActionTypeValue.CANCELLED,
}
