import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { ActionPayrollComponent } from '@features/payroll-management/components/action-payroll/action-payroll.component';
import { GeneratePayrollComponent } from '@features/payroll-management/components/generate-payroll/generate-payroll.component';

export const PAYROLL_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.PAID]: {
    dynamicComponent: ActionPayrollComponent,
    dialogConfig: {
      header: 'Mark as Paid',
      message: 'Are you sure you want to mark this payslip as paid?',
    },
  },
  [EButtonActionType.CANCEL]: {
    dynamicComponent: ActionPayrollComponent,
    dialogConfig: {
      header: 'Cancel Payslip',
      message: 'Are you sure you want to cancel this payslip?',
    },
  },
  [EButtonActionType.APPROVE]: {
    dynamicComponent: ActionPayrollComponent,
    dialogConfig: {
      header: 'Approve Payslip',
      message: 'Are you sure you want to approve this payslip?',
    },
  },
  [EButtonActionType.GENERATE]: {
    dynamicComponent: GeneratePayrollComponent,
    dialogConfig: {
      header: 'Generate Payroll',
      message: 'Are you sure you want to generate payroll?',
    },
  },
};
