import { ICONS } from '@shared/constants';
import {
  EButtonActionType,
  EButtonSeverity,
  EButtonVariant,
} from '@shared/types';

export const COMMON_FORM_ACTIONS = {
  RESET: {
    id: EButtonActionType.RESET,
    label: 'Reset',
    severity: EButtonSeverity.SECONDARY,
    tooltip: 'Reset the form',
  },
  /** Single-step add page: empties the form. Quiet (text) and placed away from Submit. */
  CLEAR_FORM: {
    id: EButtonActionType.RESET,
    label: 'Clear form',
    icon: ICONS.COMMON.ERASER,
    variant: EButtonVariant.TEXT,
    severity: EButtonSeverity.SECONDARY,
    tooltip: 'Clear every field on this form',
    disabledTooltip: 'Nothing has been filled in yet',
  },
  /** Single-step edit page: puts the saved details back. */
  UNDO_FORM_CHANGES: {
    id: EButtonActionType.RESET,
    label: 'Undo changes',
    icon: ICONS.COMMON.UNDO,
    variant: EButtonVariant.TEXT,
    severity: EButtonSeverity.SECONDARY,
    tooltip: 'Put the saved details back',
    disabledTooltip: 'No changes to undo',
  },
  /** Multi-step add form: wipes every step. Kept quiet (text) and away from Submit. */
  CLEAR_ALL_STEPS: {
    id: EButtonActionType.RESET,
    label: 'Clear all steps',
    icon: ICONS.COMMON.ERASER,
    variant: EButtonVariant.TEXT,
    severity: EButtonSeverity.SECONDARY,
    tooltip: 'Clear every step of this form',
    disabledTooltip: 'Nothing has been filled in yet',
  },
  /** Multi-step edit form: every step goes back to the saved details. */
  UNDO_ALL_CHANGES: {
    id: EButtonActionType.RESET,
    label: 'Undo all changes',
    icon: ICONS.COMMON.UNDO,
    variant: EButtonVariant.TEXT,
    severity: EButtonSeverity.SECONDARY,
    tooltip: 'Put every step back to the saved details',
    disabledTooltip: 'No changes to undo',
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
