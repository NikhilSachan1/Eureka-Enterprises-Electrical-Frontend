import { ICONS } from '@shared/constants';

export const STATUS_ICON_GROUPS: Record<string, string> = {
  // Success/Approved statuses
  approved: ICONS.ACTIONS.CHECK_CIRCLE,
  approve: ICONS.ACTIONS.CHECK_CIRCLE,
  present: ICONS.ACTIONS.CHECK_CIRCLE,
  'total credit': ICONS.COMMON.ARROW_UP,
  'period credit': ICONS.COMMON.ARROW_UP,
  'active employees': ICONS.EMPLOYEE.GROUP,

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

  // Warning/Pending statuses
  pending: ICONS.ATTENDANCE.REGULARIZE,
  leave: ICONS.LEAVE.GET,
  regularize: ICONS.ATTENDANCE.REGULARIZE,
  edit: ICONS.ACTIONS.EDIT,
  cancel: ICONS.ACTIONS.BAN,
  cancelled: ICONS.ACTIONS.BAN,
  'new joiners last 30 days': ICONS.EMPLOYEE.GROUP,

  // Info statuses
  holiday: ICONS.ATTENDANCE.CALENDAR,
  view: ICONS.ACTIONS.EYE,
  total: ICONS.COMMON.CHART,
  'total employees': ICONS.EMPLOYEE.GROUP,
  'opening balance': ICONS.EXPENSE.MONEY,
  'total balance': ICONS.EXPENSE.MONEY,
  male: ICONS.COMMON.USER,
  female: ICONS.COMMON.USER,
} as const;
