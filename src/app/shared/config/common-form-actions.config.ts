import { ICONS } from '@shared/constants';
import { EButtonActionType, EButtonSeverity } from '@shared/types';

export const COMMON_FORM_ACTIONS = {
  RESET: {
    id: EButtonActionType.RESET,
    label: 'Reset',
    severity: EButtonSeverity.SECONDARY,
    tooltip: 'Reset the form',
  },
  SUBMIT: {
    id: EButtonActionType.SUBMIT,
    label: 'Submit',
    type: 'submit',
    severity: EButtonSeverity.PRIMARY,
    tooltip: 'Submit the form',
  },
  FILTER: {
    id: EButtonActionType.FILTER,
    label: 'Search',
    tooltip: 'Apply filter',
    type: 'submit',
    severity: EButtonSeverity.PRIMARY,
    icon: ICONS.COMMON.SEARCH,
  },
};
