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
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import {
  ConfirmationDialogService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { finalize } from 'rxjs';
import { BankTransferService } from '../../services/bank-transfer.service';
import {
  IBankTransferGetBaseResponseDto,
  ILockBankTransferResponseDto,
} from '../../types/bank-transfer.dto';

/** Confirms an admin lock / unlock of one bank transfer (`lock` picks which). */
@Component({
  selector: 'app-lock-bank-transfer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './lock-bank-transfer.component.html',
  styleUrl: './lock-bank-transfer.component.scss',
})
export class LockBankTransferComponent implements OnInit, IDialogActionHandler {
  private readonly bankTransferService = inject(BankTransferService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly selectedRecord =
    input.required<IBankTransferGetBaseResponseDto[]>();
  protected readonly lock = input.required<boolean>();
  protected readonly onSuccess = input.required<() => void>();

  private bankTransferId?: string;

  ngOnInit(): void {
    const [row] = this.selectedRecord() ?? [];
    if (!row) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to lock / unlock a bank transfer but was not provided'
      );
      return;
    }
    this.bankTransferId = row.id;
  }

  onDialogAccept(): void {
    if (!this.bankTransferId) {
      return;
    }
    this.executeLockAction(this.bankTransferId, this.lock());
  }

  private executeLockAction(bankTransferId: string, lock: boolean): void {
    this.loadingService.show({
      title: lock ? 'Locking bank transfer' : 'Unlocking bank transfer',
      message: lock
        ? "We're locking this bank transfer. This will just take a moment."
        : "We're unlocking this bank transfer. This will just take a moment.",
    });

    this.bankTransferService
      .setBankTransferLock(bankTransferId, lock)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ILockBankTransferResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error(
            `Failed to ${lock ? 'lock' : 'unlock'} bank transfer`,
            error
          );
          this.notificationService.error(
            `Failed to ${lock ? 'lock' : 'unlock'} the bank transfer.`
          );
        },
      });
  }
}
