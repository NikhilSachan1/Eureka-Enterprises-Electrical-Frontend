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
import { InvoiceService } from '../../services/invoice.service';
import {
  IUnlockRejectInvoiceResponseDto,
  IInvoiceGetBaseResponseDto,
} from '../../types/invoice.dto';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-unlock-request-reject-invoice',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './unlock-request-reject-invoice.component.html',
  styleUrl: './unlock-request-reject-invoice.component.scss',
})
export class UnlockRequestRejectInvoiceComponent
  implements OnInit, IDialogActionHandler
{
  private readonly invoiceService = inject(InvoiceService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly selectedRecord =
    input.required<IInvoiceGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  private invoiceId?: string;

  ngOnInit(): void {
    const rows = this.selectedRecord();
    if (!rows?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to reject invoice unlock request but was not provided'
      );
      return;
    }
    this.invoiceId = rows[0].id;
  }

  onDialogAccept(): void {
    if (!this.invoiceId) {
      return;
    }
    this.executeInvoiceUnlockRequestRejectAction(this.invoiceId);
  }

  private executeInvoiceUnlockRequestRejectAction(invoiceId: string): void {
    this.loadingService.show({
      title: 'Rejecting unlock request',
      message:
        "We're rejecting the unlock request for this invoice. This will just take a moment.",
    });

    this.invoiceService
      .unlockRequestRejectInvoice(invoiceId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IUnlockRejectInvoiceResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to reject invoice unlock request', error);
          this.notificationService.error(
            'Failed to reject invoice unlock request.'
          );
        },
      });
  }
}
