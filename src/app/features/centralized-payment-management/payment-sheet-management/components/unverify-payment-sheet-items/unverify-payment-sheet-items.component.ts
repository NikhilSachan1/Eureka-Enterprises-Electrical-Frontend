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
  IUnverifyPaymentSheetItemsFormDto,
  IUnverifyPaymentSheetItemsResponseDto,
} from '../../types/payment-sheet.dto';
import { IPaymentSheetDetailItemRow } from '../../types/payment-sheet-detail.interface';

@Component({
  selector: 'app-unverify-payment-sheet-items',
  imports: [],
  templateUrl: './unverify-payment-sheet-items.component.html',
  styleUrl: './unverify-payment-sheet-items.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnverifyPaymentSheetItemsComponent
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
    if (!this.paymentSheetId() || !this.getBeneficiaryIds().length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Payment sheet id and selected beneficiaries are required to unverify but were not provided'
      );
    }
  }

  onDialogAccept(): void {
    const paymentSheetId = this.paymentSheetId();
    const beneficiaryIds = this.getBeneficiaryIds();

    if (!paymentSheetId || !beneficiaryIds.length) {
      return;
    }

    this.executeUnverifyPaymentSheetItemsAction(paymentSheetId, {
      beneficiaryIds,
    });
  }

  private getBeneficiaryIds(): string[] {
    return [
      ...new Set(
        this.selectedRecord()
          .map(row => row.beneficiaryId)
          .filter((id): id is string => Boolean(id))
      ),
    ];
  }

  private executeUnverifyPaymentSheetItemsAction(
    paymentSheetId: string,
    formData: IUnverifyPaymentSheetItemsFormDto
  ): void {
    this.loadingService.show({
      title: 'Unverifying beneficiaries',
      message:
        "We're unverifying the selected beneficiaries. This will just take a moment.",
    });

    this.paymentSheetService
      .unverifyPaymentSheetItems(paymentSheetId, formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IUnverifyPaymentSheetItemsResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to unverify payment sheet items', error);
          this.notificationService.error(
            'Failed to unverify selected beneficiaries.'
          );
        },
      });
  }
}
