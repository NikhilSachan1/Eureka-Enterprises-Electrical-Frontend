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
        'Assign this employee to a project? Choose the project and allocate date below.',
    },
    dynamicComponent: ActionWorkforceAllocationComponent,
  },
  [EButtonActionType.TRANSFER]: {
    dialogConfig: {
      header: 'Transfer employee',
      message:
        'Move this employee to another project? Choose the new project, release date, and allocate date below.',
    },
    dynamicComponent: ActionWorkforceAllocationComponent,
  },
  [EButtonActionType.DEALLOCATE]: {
    dialogConfig: {
      header: 'Deallocate employee',
      message:
        'Remove this employee from their current project? Choose the release date below.',
    },
    dynamicComponent: ActionWorkforceAllocationComponent,
  },
};
