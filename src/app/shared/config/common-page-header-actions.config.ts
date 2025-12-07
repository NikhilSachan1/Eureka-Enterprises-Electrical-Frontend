import { EButtonActionType } from '@shared/types';
import { ICONS } from '@shared/constants';

export const COMMON_PAGE_HEADER_ACTIONS = {
  PAGE_HEADER_BUTTON_1: {
    id: EButtonActionType.PAGE_HEADER_BUTTON_1,
    icon: ICONS.COMMON.PLUS,
  },
  PAGE_HEADER_BUTTON_2: {
    id: EButtonActionType.PAGE_HEADER_BUTTON_2,
    icon: ICONS.ACTIONS.PENCIL,
  },
} as const;
