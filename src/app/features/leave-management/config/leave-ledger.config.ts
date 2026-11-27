import { Validators } from '@angular/forms';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { EDataType, IFormConfig, IPageHeaderConfig } from '@shared/types';
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
