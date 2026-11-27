import { Validators } from '@angular/forms';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { CONFIGURATION_KEYS, ICONS, MODULE_NAMES } from '@shared/constants';
import {
  EDataType,
  IDialogActionConfig,
  IFormConfig,
  IPageHeaderConfig,
} from '@shared/types';
import { ELeaveLedgerEntryType } from '../types/leave-ledger.enum';
import {
  ILeaveLedgerEmployeeFormDto,
  ILeaveLedgerEntryTypeView,
} from '../types/leave-ledger.interface';

export const LEAVE_LEDGER_PAGE_HEADER: IPageHeaderConfig = {
  title: 'Leave Ledger',
  subtitle:
    'Every leave credited and used, like a passbook. Leave is earned from attendance.',
};

export const LEAVE_RECALCULATION_APPLY_ACTION = 'applyRecalculation';

export const createLeaveRecalculationPageHeader = (
  canApply: boolean,
  pendingCount: number
): IPageHeaderConfig => ({
  title: 'Leave Credit Recalculation',
  subtitle:
    'The old monthly credit measured against attendance. Nothing changes until you apply it.',
  showHeaderButton: true,
  headerButtonConfig: [
    {
      ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
      label: 'Apply correction',
      icon: ICONS.ACTIONS.CHECK_CIRCLE,
      actionName: LEAVE_RECALCULATION_APPLY_ACTION,
      permission: [APP_PERMISSION.LEAVE.CREDIT_RECALCULATE],
      disabled: !canApply || pendingCount === 0,
      disabledTooltip: !canApply
        ? 'The old credit covers a month that has not finished yet.'
        : 'Nothing left to correct.',
    },
  ],
});

/** How each kind of ledger row reads: label, tag colour, icon. */
export const LEAVE_LEDGER_ENTRY_TYPE_VIEW: Record<
  ELeaveLedgerEntryType,
  ILeaveLedgerEntryTypeView
> = {
  [ELeaveLedgerEntryType.ADVANCE_CREDIT]: {
    label: 'Advance credit',
    severity: 'info',
    icon: 'pi pi-forward',
  },
  [ELeaveLedgerEntryType.MONTHLY_ACCRUAL]: {
    label: 'Earned (attendance)',
    severity: 'success',
    icon: 'pi pi-calendar-plus',
  },
  [ELeaveLedgerEntryType.HOLIDAY_WORK_CREDIT]: {
    label: 'Holiday work',
    severity: 'success',
    icon: 'pi pi-star',
  },
  [ELeaveLedgerEntryType.LEAVE_DEBIT]: {
    label: 'Leave taken',
    severity: 'warn',
    icon: 'pi pi-arrow-down',
  },
  [ELeaveLedgerEntryType.LEAVE_REVERSAL]: {
    label: 'Leave given back',
    severity: 'secondary',
    icon: 'pi pi-replay',
  },
  [ELeaveLedgerEntryType.LWP_CONVERSION]: {
    label: 'Turned into LWP',
    severity: 'danger',
    icon: 'pi pi-ban',
  },
  [ELeaveLedgerEntryType.LEGACY_OPENING]: {
    label: 'Opening (old system)',
    severity: 'secondary',
    icon: 'pi pi-box',
  },
  [ELeaveLedgerEntryType.LEGACY_CONSUMED]: {
    label: 'Used before ledger',
    severity: 'secondary',
    icon: 'pi pi-box',
  },
  [ELeaveLedgerEntryType.LEGACY_CORRECTION]: {
    label: 'Correction (HR)',
    severity: 'contrast',
    icon: 'pi pi-sliders-h',
  },
};

export const LEAVE_LEDGER_UNKNOWN_ENTRY_VIEW: ILeaveLedgerEntryTypeView = {
  label: 'Adjustment',
  severity: 'secondary',
  icon: 'pi pi-circle',
};

export const LEAVE_LEDGER_EMPLOYEE_FORM_CONFIG: IFormConfig<ILeaveLedgerEmployeeFormDto> =
  {
    fields: {
      employeeName: {
        fieldType: EDataType.SELECT,
        id: 'employeeName',
        fieldName: 'employeeName',
        label: 'Employee',
        selectConfig: {
          dynamicDropdown: {
            moduleName: MODULE_NAMES.EMPLOYEE,
            dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
            employeeStatusFilter: ['ACTIVE'],
          },
        },
        validators: [Validators.required],
      },
    },
  };

export const buildLeaveRecalculationApplyDialog = (
  employeeCount: number,
  onAccept: () => void
): IDialogActionConfig => ({
  dialogConfig: {
    header: 'Apply leave correction?',
    message: `The leave balance of ${employeeCount} employee(s) will be corrected to what their attendance earned. No balance goes below 0; leave already used beyond that stays as it is for you to decide. This runs once and is recorded in each ledger.`,
  },
  onAccept,
});

export const LEAVE_LEDGER_LOADING = {
  APPLY: {
    title: 'Applying correction',
    message:
      "We're correcting the leave balances. This will just take a moment.",
  },
};
