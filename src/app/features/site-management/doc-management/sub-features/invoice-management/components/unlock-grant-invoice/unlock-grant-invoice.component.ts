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
  IUnlockGrantInvoiceResponseDto,
  IInvoiceGetBaseResponseDto,
} from '../../types/invoice.dto';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-unlock-grant-invoice',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './unlock-grant-invoice.component.html',
  styleUrl: './unlock-grant-invoice.component.scss',
})
export class UnlockGrantInvoiceComponent
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
        'Selected record is required to grant invoice unlock but was not provided'
      );
      return;
    }
    this.invoiceId = rows[0].id;
  }

  onDialogAccept(): void {
    if (!this.invoiceId) {
      return;
    }
    this.executeInvoiceUnlockGrantAction(this.invoiceId);
  }

  private executeInvoiceUnlockGrantAction(invoiceId: string): void {
    this.loadingService.show({
      title: 'Granting unlock',
      message:
        "We're granting unlock for this invoice. This will just take a moment.",
    });

    this.invoiceService
      .unlockGrantInvoice(invoiceId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IUnlockGrantInvoiceResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to grant invoice unlock', error);
          this.notificationService.error('Failed to grant invoice unlock.');
        },
      });
  }
}
