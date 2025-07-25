import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { ConfirmationDialogService } from '@shared/services';
import { LoggerService } from '@core/services';
import { EButtonSeverity, EDialogType } from '@shared/types';
import { IConfirmationDialogConfig } from '@shared/models';
import { ICanComponentDeactivate } from '../models';

export const canDeactivateGuard: CanDeactivateFn<ICanComponentDeactivate> = (
  component: ICanComponentDeactivate
) => {
  const confirmationDialogService = inject(ConfirmationDialogService);
  const logger = inject(LoggerService);

  try {
    if (component.canDeactivate()) {
      logger.info(
        'CanDeactivate Guard: Form has no unsaved changes, allowing navigation'
      );
      return true;
    }

    logger.info(
      'CanDeactivate Guard: Form has unsaved changes, showing confirmation dialog'
    );

    return new Promise<boolean>(resolve => {
      const dialogConfig = createCanDeactivateDialogConfig(
        (): void => {
          logger.info('CanDeactivate Guard: User confirmed leaving page');
          resolve(true);
        },
        (): void => {
          logger.info('CanDeactivate Guard: User cancelled leaving page');
          resolve(false);
        }
      );

      confirmationDialogService.showConfirmationDialog(
        dialogConfig,
        EDialogType.WARNING
      );
    });
  } catch (error) {
    logger.error('CanDeactivate Guard: Error checking deactivation', error);
    return true; // Allow navigation in case of error
  }
};

const canDeactivate_DIALOG_DELETE_CONFIG: IConfirmationDialogConfig = {
  dialogSettingConfig: {
    header: 'Unsaved Changes',
    message:
      'You have unsaved changes. Are you sure you want to leave this page?',
    acceptButtonProps: {
      label: 'Leave Page',
      severity: EButtonSeverity.DANGER,
    },
    rejectButtonProps: {
      label: 'Stay',
      severity: EButtonSeverity.SECONDARY,
    },
  },
};

const createCanDeactivateDialogConfig = (
  onAccept?: () => void,
  onReject?: () => void
): IConfirmationDialogConfig => {
  return {
    ...canDeactivate_DIALOG_DELETE_CONFIG,
    onAccept,
    onReject,
  };
};
