import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoggerService } from '@core/services';
import { UserDelegationService } from '@features/settings-management/delegation-management/services/user-delegation.service';
import { IUserDelegationGetBaseResponseDto } from '@features/settings-management/delegation-management/types/user-delegation.dto';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import {
  ConfirmationDialogService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-withdraw-user-delegation',
  imports: [],
  templateUrl: './withdraw-user-delegation.component.html',
  styleUrl: './withdraw-user-delegation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WithdrawUserDelegationComponent
  implements OnInit, IDialogActionHandler
{
  private readonly userDelegationService = inject(UserDelegationService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly selectedRecord =
    input.required<IUserDelegationGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  private delegationId?: string;

  ngOnInit(): void {
    const rows = this.selectedRecord();
    if (!rows?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to withdraw a delegation but was not provided'
      );
      return;
    }
    this.delegationId = rows[0].id;
  }

  onDialogAccept(): void {
    if (!this.delegationId) {
      return;
    }
    this.executeWithdraw(this.delegationId);
  }

  private executeWithdraw(delegationId: string): void {
    this.loadingService.show({
      title: 'Withdrawing delegation',
      message:
        'The manager will no longer handle new entries for this member.',
    });

    this.userDelegationService
      .withdrawDelegation(delegationId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: response => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to withdraw delegation.', error);
        },
      });
  }
}
