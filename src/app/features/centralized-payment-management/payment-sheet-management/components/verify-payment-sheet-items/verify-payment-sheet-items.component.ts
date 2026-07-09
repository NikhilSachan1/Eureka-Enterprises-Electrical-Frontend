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
import { PaymentSheetService } from '../../services/payment-sheet.service';
import {
  IVerifyPaymentSheetItemsFormDto,
  IVerifyPaymentSheetItemsResponseDto,
} from '../../types/payment-sheet.dto';
import { IPaymentSheetDetailItemRow } from '../../types/payment-sheet-detail.interface';

@Component({
  selector: 'app-verify-payment-sheet-items',
  imports: [],
  templateUrl: './verify-payment-sheet-items.component.html',
  styleUrl: './verify-payment-sheet-items.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyPaymentSheetItemsComponent
  implements OnInit, IDialogActionHandler
{
  private readonly paymentSheetService = inject(PaymentSheetService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly selectedRecord =
    input.required<IPaymentSheetDetailItemRow[]>();
  protected readonly paymentSheetId = input.required<string>();
  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    if (!this.paymentSheetId() || !this.getItemIds().length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Payment sheet id and selected items are required to verify but were not provided'
      );
    }
  }

  onDialogAccept(): void {
    const paymentSheetId = this.paymentSheetId();
    const itemIds = this.getItemIds();

    if (!paymentSheetId || !itemIds.length) {
      return;
    }

    this.executeVerifyPaymentSheetItemsAction(paymentSheetId, {
      itemIds,
    });
  }

  private getItemIds(): string[] {
    return [
      ...new Set(
        this.selectedRecord()
          .map(row => row.id)
          .filter((id): id is string => Boolean(id))
      ),
    ];
  }

  private executeVerifyPaymentSheetItemsAction(
    paymentSheetId: string,
    formData: IVerifyPaymentSheetItemsFormDto
  ): void {
    this.loadingService.show({
      title: 'Verifying beneficiaries',
      message:
        "We're verifying the selected beneficiaries. This will just take a moment.",
    });

    this.paymentSheetService
      .verifyPaymentSheetItems(paymentSheetId, formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IVerifyPaymentSheetItemsResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to verify payment sheet items', error);
          this.notificationService.error(
            'Failed to verify selected beneficiaries.'
          );
        },
      });
  }
}
