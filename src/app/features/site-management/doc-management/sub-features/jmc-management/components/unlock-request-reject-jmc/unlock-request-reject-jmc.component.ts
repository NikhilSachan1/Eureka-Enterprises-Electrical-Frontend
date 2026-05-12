import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { LoggerService } from '@core/services';
import {
  ConfirmationDialogService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { JmcService } from '../../services/jmc.service';
import {
  IUnlockRejectJmcResponseDto,
  IJmcGetBaseResponseDto,
} from '../../types/jmc.dto';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-unlock-request-reject-jmc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './unlock-request-reject-jmc.component.html',
  styleUrl: './unlock-request-reject-jmc.component.scss',
})
export class UnlockRequestRejectJmcComponent
  implements OnInit, IDialogActionHandler
{
  private readonly jmcService = inject(JmcService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly selectedRecord =
    input.required<IJmcGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  private jmcId?: string;

  ngOnInit(): void {
    const rows = this.selectedRecord();
    if (!rows?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to reject JMC unlock request but was not provided'
      );
      return;
    }
    this.jmcId = rows[0].id;
  }

  onDialogAccept(): void {
    if (!this.jmcId) {
      return;
    }
    this.executeJmcUnlockRequestRejectAction(this.jmcId);
  }

  private executeJmcUnlockRequestRejectAction(jmcId: string): void {
    this.loadingService.show({
      title: 'Rejecting unlock request',
      message:
        "We're rejecting the unlock request for this JMC. This will just take a moment.",
    });

    this.jmcService
      .unlockRequestRejectJmc(jmcId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IUnlockRejectJmcResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to reject JMC unlock request', error);
          this.notificationService.error(
            'Failed to reject JMC unlock request.'
          );
        },
      });
  }
}
