import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { ActionPayrollComponent } from '@features/payroll-management/components/action-payroll/action-payroll.component';
import { GeneratePayrollComponent } from '@features/payroll-management/components/generate-payroll/generate-payroll.component';

export const PAYROLL_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.PAID]: {
    dynamicComponent: ActionPayrollComponent,
    dialogConfig: {
      header: 'Mark payslip as paid',
      message:
        'Record this payslip as paid? Make sure amounts and period are correct.',
    },
  },
  [EButtonActionType.CANCEL]: {
    dynamicComponent: ActionPayrollComponent,
    dialogConfig: {
      header: 'Cancel payslip',
      message:
        'Cancel this payslip? It will no longer be active in the workflow.',
    },
  },
  [EButtonActionType.APPROVE]: {
    dynamicComponent: ActionPayrollComponent,
    dialogConfig: {
      header: 'Approve payslip',
      message: 'Approve this payslip for processing?',
    },
  },
  [EButtonActionType.GENERATE]: {
    dynamicComponent: GeneratePayrollComponent,
    dialogConfig: {
      header: 'Generate payroll',
      message:
        'Run payroll generation for the selected period? This may take a moment.',
    },
  },
};
