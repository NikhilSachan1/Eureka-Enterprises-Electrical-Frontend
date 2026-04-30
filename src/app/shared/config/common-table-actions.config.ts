import { EButtonActionType } from '@shared/types';

export const COMMON_ROW_ACTIONS = {
  VIEW: {
    id: EButtonActionType.VIEW,
    tooltip: 'View Details',
  },

  EDIT: {
    id: EButtonActionType.EDIT,
    tooltip: 'Edit',
  },

  DELETE: {
    id: EButtonActionType.DELETE,
    tooltip: 'Delete',
  },

  APPROVE: {
    id: EButtonActionType.APPROVE,
    tooltip: 'Approve',
  },

  REJECT: {
    id: EButtonActionType.REJECT,
    tooltip: 'Reject',
  },

  CANCEL: {
    id: EButtonActionType.CANCEL,
    tooltip: 'Cancel',
  },

  SEND_MAIL: {
    id: EButtonActionType.SEND_MAIL,
    tooltip: 'Send to Mail',
  },
} as const;

export const COMMON_BULK_ACTIONS = {
  APPROVE: {
    ...COMMON_ROW_ACTIONS.APPROVE,
    label: 'Approve',
  },

  REJECT: {
    ...COMMON_ROW_ACTIONS.REJECT,
    label: 'Reject',
  },

  DELETE: {
    ...COMMON_ROW_ACTIONS.DELETE,
    label: 'Delete',
  },

  CANCEL: {
    ...COMMON_ROW_ACTIONS.CANCEL,
    label: 'Cancel',
  },
} as const;
