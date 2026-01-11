import { ICONS } from '@shared/constants';
import { StatusSeverity, IStatusStyle, IStatusEntry } from '@shared/types';

export const SEVERITY_STYLES: Record<StatusSeverity, IStatusStyle> = {
  success: {
    severity: 'success',
    bg: '!bg-green-50',
    border: 'border-green-200',
    text: 'text-green-600',
    hex: { primary: '#10b981', light: '#d1fae5', dark: '#059669' },
  },
  danger: {
    severity: 'danger',
    bg: '!bg-red-50',
    border: 'border-red-200',
    text: 'text-red-600',
    hex: { primary: '#ef4444', light: '#fee2e2', dark: '#dc2626' },
  },
  warning: {
    severity: 'warn',
    bg: '!bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-600',
    hex: { primary: '#f59e0b', light: '#fef3c7', dark: '#d97706' },
  },
  info: {
    severity: 'info',
    bg: '!bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-600',
    hex: { primary: '#3b82f6', light: '#dbeafe', dark: '#2563eb' },
  },
  secondary: {
    severity: 'secondary',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-600',
    hex: { primary: '#6b7280', light: '#f3f4f6', dark: '#4b5563' },
  },
  purple: {
    severity: 'secondary', // PrimeNG fallback
    bg: '!bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-600',
    hex: { primary: '#a855f7', light: '#f3e8ff', dark: '#7c3aed' },
  },
};

export const STATUS_MAP: Record<string, IStatusEntry> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // GENERAL / AVAILABILITY
  // ═══════════════════════════════════════════════════════════════════════════
  total: { icon: ICONS.STATUS.TOTAL, severity: 'info' },
  available: { icon: ICONS.STATUS.AVAILABLE, severity: 'success' },
  assigned: { icon: ICONS.STATUS.ASSIGNED, severity: 'info' },

  // ═══════════════════════════════════════════════════════════════════════════
  // EMPLOYEE STATUS
  // ═══════════════════════════════════════════════════════════════════════════
  active: { icon: ICONS.ACTIONS.CHECK_CIRCLE, severity: 'success' },
  inactive: { icon: ICONS.ACTIONS.TIMES, severity: 'danger' },
  archived: { icon: ICONS.ACTIONS.TIMES, severity: 'danger' },
  'total employees': { icon: ICONS.EMPLOYEE.GROUP, severity: 'info' },
  'active employees': { icon: ICONS.EMPLOYEE.GROUP, severity: 'success' },
  'inactive employees': { icon: ICONS.ACTIONS.TIMES, severity: 'danger' },
  'new joiners last 30 days': {
    icon: ICONS.EMPLOYEE.GROUP,
    severity: 'warning',
  },
  male: { icon: ICONS.COMMON.USER, severity: 'info' },
  female: { icon: ICONS.COMMON.USER, severity: 'info' },

  // ═══════════════════════════════════════════════════════════════════════════
  // APPROVAL WORKFLOW
  // ═══════════════════════════════════════════════════════════════════════════
  approved: { icon: ICONS.ACTIONS.CHECK_CIRCLE, severity: 'success' },
  approve: { icon: ICONS.ACTIONS.CHECK_CIRCLE, severity: 'success' },
  pending: { icon: ICONS.ATTENDANCE.REGULARIZE, severity: 'warning' },
  rejected: { icon: ICONS.ACTIONS.TIMES, severity: 'danger' },
  reject: { icon: ICONS.ACTIONS.TIMES, severity: 'danger' },
  cancelled: { icon: ICONS.ACTIONS.BAN, severity: 'warning' },
  cancel: { icon: ICONS.ACTIONS.BAN, severity: 'warning' },

  // ═══════════════════════════════════════════════════════════════════════════
  // ATTENDANCE
  // ═══════════════════════════════════════════════════════════════════════════
  present: { icon: ICONS.ACTIONS.CHECK_CIRCLE, severity: 'success' },
  absent: { icon: ICONS.ACTIONS.TIMES, severity: 'danger' },
  leave: { icon: ICONS.LEAVE.GET, severity: 'warning' },
  holiday: { icon: ICONS.ATTENDANCE.CALENDAR, severity: 'info' },
  regularize: { icon: ICONS.ATTENDANCE.REGULARIZE, severity: 'warning' },
  checkin: { icon: ICONS.ATTENDANCE.CHECK_IN, severity: 'success' },
  checkout: { icon: ICONS.ATTENDANCE.CHECK_OUT, severity: 'danger' },

  // ═══════════════════════════════════════════════════════════════════════════
  // DOCUMENT / EXPIRY STATUS
  // ═══════════════════════════════════════════════════════════════════════════
  expired: { icon: ICONS.STATUS.EXPIRED, severity: 'danger' },
  'expiring soon': { icon: ICONS.STATUS.EXPIRING_SOON, severity: 'warning' },

  // Calibration
  'calibrated assets': { icon: ICONS.ASSET.BOX, severity: 'success' },
  'non calibrated assets': { icon: ICONS.ASSET.BOX, severity: 'info' },
  'calibration expired': { icon: ICONS.STATUS.EXPIRED, severity: 'danger' },
  'calibration expiring soon': {
    icon: ICONS.STATUS.EXPIRING_SOON,
    severity: 'warning',
  },

  // Warranty
  'warranty expired': { icon: ICONS.STATUS.EXPIRED, severity: 'danger' },
  'warranty expiring soon': {
    icon: ICONS.STATUS.EXPIRING_SOON,
    severity: 'warning',
  },

  // Vehicle Documents
  'insurance expired': { icon: ICONS.STATUS.EXPIRED, severity: 'danger' },
  'insurance expiring soon': {
    icon: ICONS.STATUS.EXPIRING_SOON,
    severity: 'warning',
  },
  'fitness expired': { icon: ICONS.STATUS.EXPIRED, severity: 'danger' },
  'fitness expiring soon': {
    icon: ICONS.STATUS.EXPIRING_SOON,
    severity: 'warning',
  },
  'PUC expired': { icon: ICONS.STATUS.EXPIRED, severity: 'danger' },
  'puc expiring soon': {
    icon: ICONS.STATUS.EXPIRING_SOON,
    severity: 'warning',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VEHICLE SERVICE STATUS
  // ═══════════════════════════════════════════════════════════════════════════
  ok: { icon: ICONS.ACTIONS.CHECK_CIRCLE, severity: 'success' },
  duesoon: { icon: ICONS.STATUS.EXPIRING_SOON, severity: 'warning' },
  'service due soon': { icon: ICONS.STATUS.EXPIRING_SOON, severity: 'warning' },
  overdue: { icon: ICONS.STATUS.EXPIRED, severity: 'danger' },
  'service due overdue': { icon: ICONS.ACTIONS.TIMES, severity: 'danger' },
  'under maintenance': { icon: ICONS.STATUS.EXPIRING_SOON, severity: 'info' },

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDOVER WORKFLOW
  // ═══════════════════════════════════════════════════════════════════════════
  handoverinitiate: { icon: ICONS.ACTIONS.SEND, severity: 'success' },
  handoveraccepted: { icon: ICONS.ACTIONS.CHECK_CIRCLE, severity: 'success' },
  handoverrejected: { icon: ICONS.ACTIONS.TIMES, severity: 'danger' },
  handovercancelled: { icon: ICONS.ACTIONS.TIMES, severity: 'warning' },

  // ═══════════════════════════════════════════════════════════════════════════
  // PAYROLL / SALARY
  // ═══════════════════════════════════════════════════════════════════════════
  earnings: { icon: ICONS.COMMON.ARROW_UP, severity: 'success' },
  deductions: { icon: ICONS.EXPENSE.MONEY, severity: 'danger' },
  'food allowance': { icon: ICONS.EXPENSE.MONEY, severity: 'warning' },
  'gross salary': { icon: ICONS.EXPENSE.MONEY, severity: 'info' },
  'net salary': { icon: ICONS.EXPENSE.MONEY, severity: 'success' },
  'in hand': { icon: ICONS.EXPENSE.MONEY, severity: 'success' },
  'ctc (annual)': { icon: ICONS.EXPENSE.MONEY, severity: 'purple' },

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPENSE / FINANCIAL
  // ═══════════════════════════════════════════════════════════════════════════
  'opening balance': { icon: ICONS.EXPENSE.MONEY, severity: 'info' },
  'closing balance': { icon: ICONS.EXPENSE.MONEY, severity: 'danger' },
  'total balance': { icon: ICONS.EXPENSE.MONEY, severity: 'purple' },
  'total credit': { icon: ICONS.COMMON.ARROW_UP, severity: 'success' },
  'period credit': { icon: ICONS.COMMON.ARROW_UP, severity: 'success' },
  'total credited': { icon: ICONS.COMMON.ARROW_UP, severity: 'success' },
  'total debit': { icon: ICONS.EXPENSE.MONEY, severity: 'danger' },
  'period debit': { icon: ICONS.EXPENSE.MONEY, severity: 'danger' },
  'total consumed': { icon: ICONS.EXPENSE.MONEY, severity: 'danger' },

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIONS (for buttons/dialogs)
  // ═══════════════════════════════════════════════════════════════════════════
  view: { icon: ICONS.ACTIONS.EYE, severity: 'info' },
  edit: { icon: ICONS.ACTIONS.EDIT, severity: 'warning' },
  delete: { icon: ICONS.ACTIONS.TRASH, severity: 'danger' },
  deallocate: { icon: ICONS.ACTIONS.TRASH, severity: 'danger' },
  sendpasswordlink: { icon: ICONS.ACTIONS.SEND, severity: 'warning' },
  changeemployeestatus: { icon: ICONS.COMMON.TOGGLE, severity: 'warning' },
  eventhistory: { icon: ICONS.COMMON.LIST, severity: 'info' },
  vehicleserviceinfo: { icon: ICONS.COMMON.LIST, severity: 'info' },
  setpermissions: { icon: ICONS.SECURITY.SHIELD, severity: 'info' },
  clearselection: { icon: ICONS.ACTIONS.CHECK_CIRCLE, severity: 'success' },
  download: { icon: ICONS.COMMON.DOWNLOAD, severity: 'success' },
  filter: { icon: ICONS.COMMON.SEARCH, severity: 'success' },

  // Page header buttons
  pageheaderbutton1: { icon: ICONS.COMMON.PLUS, severity: 'success' },
  pageheaderbutton2: { icon: ICONS.COMMON.PLUS, severity: 'warning' },

  // ═══════════════════════════════════════════════════════════════════════════
  // EVENT TRACKING / HISTORY
  // ═══════════════════════════════════════════════════════════════════════════
  'total events': { icon: ICONS.COMMON.LIST, severity: 'info' },
  'times marked available': {
    icon: ICONS.ACTIONS.CHECK_CIRCLE,
    severity: 'success',
  },
  'times marked assigned': { icon: ICONS.EMPLOYEE.USER, severity: 'info' },
  'times marked updated': { icon: ICONS.ACTIONS.EDIT, severity: 'info' },
  'times marked deallocated': { icon: ICONS.ACTIONS.TRASH, severity: 'danger' },
  'times marked handover initiated': {
    icon: ICONS.ACTIONS.SEND,
    severity: 'warning',
  },
  'times marked handover accepted': {
    icon: ICONS.ACTIONS.CHECK_CIRCLE,
    severity: 'success',
  },
  'times marked handover rejected': {
    icon: ICONS.ACTIONS.TIMES,
    severity: 'danger',
  },
  'times marked handover cancelled': {
    icon: ICONS.ACTIONS.BAN,
    severity: 'success',
  },
};
