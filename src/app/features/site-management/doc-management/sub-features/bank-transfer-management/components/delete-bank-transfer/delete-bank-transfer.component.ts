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
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BankTransferService } from '../../services/bank-transfer.service';
import {
  IBankTransferGetBaseResponseDto,
  IDeleteBankTransferResponseDto,
} from '../../types/bank-transfer.dto';

@Component({
  selector: 'app-delete-bank-transfer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './delete-bank-transfer.component.html',
  styleUrl: './delete-bank-transfer.component.scss',
})
export class DeleteBankTransferComponent
  implements OnInit, IDialogActionHandler
{
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
  protected readonly onSuccess = input.required<() => void>();

  private bankTransferId?: string;

  ngOnInit(): void {
    const rows = this.selectedRecord();
    if (!rows?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to delete bank transfer but was not provided'
      );
      return;
    }
    this.bankTransferId = rows[0].id;
  }

  onDialogAccept(): void {
    if (!this.bankTransferId) {
      return;
    }
    this.executeDeleteAction(this.bankTransferId);
  }

  private executeDeleteAction(bankTransferId: string): void {
    this.loadingService.show({
      title: 'Deleting bank transfer',
      message:
        "We're removing the bank transfer. This will just take a moment.",
    });

    this.bankTransferService
      .deleteBankTransfer(bankTransferId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IDeleteBankTransferResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to delete bank transfer', error);
          this.notificationService.error('Failed to delete bank transfer.');
        },
      });
  }
}
