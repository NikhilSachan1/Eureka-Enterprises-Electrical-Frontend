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
import { InvoiceService } from '../../services/invoice.service';
import {
  IDeleteInvoiceResponseDto,
  IInvoiceGetBaseResponseDto,
} from '../../types/invoice.dto';

@Component({
  selector: 'app-delete-invoice',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './delete-invoice.component.html',
  styleUrl: './delete-invoice.component.scss',
})
export class DeleteInvoiceComponent implements OnInit, IDialogActionHandler {
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
        'Selected record is required to delete invoice but was not provided'
      );
      return;
    }
    this.invoiceId = rows[0].id;
  }

  onDialogAccept(): void {
    if (!this.invoiceId) {
      return;
    }
    this.executeInvoiceDeleteAction(this.invoiceId);
  }

  private executeInvoiceDeleteAction(invoiceId: string): void {
    this.loadingService.show({
      title: 'Deleting invoice',
      message: "We're removing the invoice. This will just take a moment.",
    });

    this.invoiceService
      .deleteInvoice(invoiceId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IDeleteInvoiceResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to delete invoice', error);
          this.notificationService.error('Failed to delete invoice.');
        },
      });
  }
}
