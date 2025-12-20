import { EButtonActionType } from '@shared/types';
import { IconUtil } from '@shared/utility';

export const COMMON_ROW_ACTIONS = {
  VIEW: {
    id: EButtonActionType.VIEW,
    icon: IconUtil.getIcon(EButtonActionType.VIEW) ?? undefined,
    tooltip: 'View Details',
  },

  EDIT: {
    id: EButtonActionType.EDIT,
    icon: IconUtil.getIcon(EButtonActionType.EDIT) ?? undefined,
    tooltip: 'Edit',
  },

  DELETE: {
    id: EButtonActionType.DELETE,
    icon: IconUtil.getIcon(EButtonActionType.DELETE) ?? undefined,
    tooltip: 'Delete',
  },

  APPROVE: {
    id: EButtonActionType.APPROVE,
    icon: IconUtil.getIcon(EButtonActionType.APPROVE) ?? undefined,
    tooltip: 'Approve',
  },

  REJECT: {
    id: EButtonActionType.REJECT,
    icon: IconUtil.getIcon(EButtonActionType.REJECT) ?? undefined,
    tooltip: 'Reject',
  },

  CANCEL: {
    id: EButtonActionType.CANCEL,
    icon: IconUtil.getIcon(EButtonActionType.CANCEL) ?? undefined,
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
