import { ICONS } from '@shared/constants';

export const STATUS_ICON_GROUPS: Record<string, string> = {
  // Common status icons (used across modules)
  total: ICONS.STATUS.TOTAL,
  available: ICONS.STATUS.AVAILABLE,
  assigned: ICONS.STATUS.ASSIGNED,
  expired: ICONS.STATUS.EXPIRED,
  'expiring soon': ICONS.STATUS.EXPIRING_SOON,

  // Calibration & Warranty (common for assets)
  'calibrated assets': ICONS.ASSET.BOX,
  'non calibrated assets': ICONS.ASSET.BOX,
  'calibration expired': ICONS.STATUS.EXPIRED,
  'calibration expiring soon': ICONS.STATUS.EXPIRING_SOON,
  'warranty expired': ICONS.STATUS.EXPIRED,
  'warranty expiring soon': ICONS.STATUS.EXPIRING_SOON,

  // Success/Approved statuses
  approved: ICONS.ACTIONS.CHECK_CIRCLE,
  approve: ICONS.ACTIONS.CHECK_CIRCLE,
  present: ICONS.ACTIONS.CHECK_CIRCLE,
  'total credit': ICONS.COMMON.ARROW_UP,
  'period credit': ICONS.COMMON.ARROW_UP,
  'active employees': ICONS.EMPLOYEE.GROUP,
  handoverinitiate: ICONS.ACTIONS.SEND,
  handoveraccepted: ICONS.ACTIONS.CHECK_CIRCLE,
  'times marked available': ICONS.ACTIONS.CHECK_CIRCLE,
  'times marked handover accepted': ICONS.ACTIONS.CHECK_CIRCLE,

  // Danger/Rejected statuses
  rejected: ICONS.ACTIONS.TIMES,
  reject: ICONS.ACTIONS.TIMES,
  absent: ICONS.ACTIONS.TIMES,
  delete: ICONS.ACTIONS.TRASH,
  'closing balance': ICONS.EXPENSE.MONEY,
  'total debit': ICONS.EXPENSE.MONEY,
  'period debit': ICONS.EXPENSE.MONEY,
  'total consumed': ICONS.EXPENSE.MONEY,
  'inactive employees': ICONS.ACTIONS.TIMES,
  handoverrejected: ICONS.ACTIONS.TIMES,
  deallocate: ICONS.ACTIONS.TRASH,
  'times marked deallocated': ICONS.ACTIONS.TRASH,
  'times marked handover rejected': ICONS.ACTIONS.TIMES,
  'times marked handover cancelled': ICONS.ACTIONS.BAN,

  // Warning/Pending statuses
  pending: ICONS.ATTENDANCE.REGULARIZE,
  leave: ICONS.LEAVE.GET,
  regularize: ICONS.ATTENDANCE.REGULARIZE,
  edit: ICONS.ACTIONS.EDIT,
  cancel: ICONS.ACTIONS.BAN,
  cancelled: ICONS.ACTIONS.BAN,
  'new joiners last 30 days': ICONS.EMPLOYEE.GROUP,
  sendpasswordlink: ICONS.ACTIONS.SEND,
  changeemployeestatus: ICONS.COMMON.TOGGLE,
  handovercancelled: ICONS.ACTIONS.TIMES,
  'times marked handover initiated': ICONS.ACTIONS.SEND,

  // Info statuses
  holiday: ICONS.ATTENDANCE.CALENDAR,
  view: ICONS.ACTIONS.EYE,
  'total employees': ICONS.EMPLOYEE.GROUP,
  'opening balance': ICONS.EXPENSE.MONEY,
  'total balance': ICONS.EXPENSE.MONEY,
  male: ICONS.COMMON.USER,
  female: ICONS.COMMON.USER,
  eventhistory: ICONS.COMMON.LIST,
  'times marked assigned': ICONS.EMPLOYEE.USER,
  'times marked updated': ICONS.ACTIONS.EDIT,
  'total events': ICONS.COMMON.LIST,
} as const;
