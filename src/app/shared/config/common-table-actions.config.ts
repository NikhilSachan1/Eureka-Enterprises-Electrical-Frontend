import { ETableActionType } from '@shared/types';
import { ICONS } from '@shared/constants';

export const COMMON_ROW_ACTIONS = {
  VIEW: {
    id: ETableActionType.VIEW,
    icon: ICONS.COMMON.VIEW,
    tooltip: 'View Details',
  },

  EDIT: {
    id: ETableActionType.EDIT,
    icon: ICONS.ACTIONS.EDIT,
    tooltip: 'Edit',
  },

  DELETE: {
    id: ETableActionType.DELETE,
    icon: ICONS.ACTIONS.TRASH,
    tooltip: 'Delete',
  },

  APPROVE: {
    id: ETableActionType.APPROVE,
    icon: ICONS.ACTIONS.CHECK,
    tooltip: 'Approve',
  },

  REJECT: {
    id: ETableActionType.REJECT,
    icon: ICONS.ACTIONS.TIMES,
    tooltip: 'Reject',
  },

  CANCEL: {
    id: ETableActionType.CANCEL,
    icon: ICONS.ACTIONS.TIMES,
    tooltip: 'Cancel',
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
