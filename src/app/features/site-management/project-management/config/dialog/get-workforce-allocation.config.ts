import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { ActionWorkforceAllocationComponent } from '../../components/action-workforce-allocation/action-workforce-allocation.component';

export const WORKFORCE_ALLOCATION_ACTION_CONFIG_MAP: Record<
  string,
  IDialogActionConfig
> = {
  [EButtonActionType.ALLOCATE]: {
    dialogConfig: {
      header: 'Allocate employee',
      message:
        'Choose the project, role, and start date. Leave the end date empty for an ongoing allocation, or set it to record a finished past or future period. Their current project stays unchanged.',
      labels: {
        actionWord: 'allocate',
        singleLabel: 'Allocate Employee',
        bulkLabel: 'Allocate Employees',
      },
    },
    dynamicComponent: ActionWorkforceAllocationComponent,
  },
  [EButtonActionType.TRANSFER]: {
    dialogConfig: {
      header: 'Transfer employee',
      message:
        'Choose release date from current project, then new project and allocate date.',
    },
    dynamicComponent: ActionWorkforceAllocationComponent,
  },
  [EButtonActionType.DEALLOCATE]: {
    dialogConfig: {
      header: 'Deallocate employee',
      message:
        'Remove this employee from their current project? Choose the release date below.',
      labels: {
        actionWord: 'deallocate',
        singleLabel: 'Deallocate Employee',
        bulkLabel: 'Deallocate Employees',
      },
    },
    dynamicComponent: ActionWorkforceAllocationComponent,
  },
};
