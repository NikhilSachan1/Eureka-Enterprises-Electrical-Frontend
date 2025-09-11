import { ICONS } from '@shared/constants';
import { EButtonSeverity } from '@shared/types';

export const COMMON_FORM_ACTIONS = {
  RESET: {
    label: 'Reset',
    severity: EButtonSeverity.SECONDARY,
    tooltip: 'Reset the form',
  },
  SUBMIT: {
    label: 'Submit',
    type: 'submit',
    severity: EButtonSeverity.PRIMARY,
    tooltip: 'Submit the form',
  },
  FILTER: {
    label: 'Search',
    tooltip: 'Apply filter',
    type: 'submit',
    severity: EButtonSeverity.PRIMARY,
    icon: ICONS.COMMON.SEARCH,
  },
};
