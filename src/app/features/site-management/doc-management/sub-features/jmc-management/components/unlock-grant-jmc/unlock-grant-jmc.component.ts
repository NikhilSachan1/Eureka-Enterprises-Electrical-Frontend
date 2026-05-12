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
  IUnlockGrantJmcResponseDto,
  IJmcGetBaseResponseDto,
} from '../../types/jmc.dto';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-unlock-grant-jmc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './unlock-grant-jmc.component.html',
  styleUrl: './unlock-grant-jmc.component.scss',
})
export class UnlockGrantJmcComponent implements OnInit, IDialogActionHandler {
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
        'Selected record is required to grant JMC unlock but was not provided'
      );
      return;
    }
    this.jmcId = rows[0].id;
  }

  onDialogAccept(): void {
    if (!this.jmcId) {
      return;
    }
    this.executeJmcUnlockGrantAction(this.jmcId);
  }

  private executeJmcUnlockGrantAction(jmcId: string): void {
    this.loadingService.show({
      title: 'Granting unlock',
      message:
        "We're granting unlock for this JMC. This will just take a moment.",
    });

    this.jmcService
      .unlockGrantJmc(jmcId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IUnlockGrantJmcResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to grant JMC unlock', error);
          this.notificationService.error('Failed to grant JMC unlock.');
        },
      });
  }
}
