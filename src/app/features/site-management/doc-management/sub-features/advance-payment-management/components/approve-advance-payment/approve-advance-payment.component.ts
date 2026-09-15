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
import { AdvancePaymentService } from '../../services/advance-payment.service';
import {
  IApproveAdvancePaymentResponseDto,
  IAdvancePaymentGetBaseResponseDto,
} from '../../types/advance-payment.dto';

@Component({
  selector: 'app-approve-advance-payment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './approve-advance-payment.component.html',
  styleUrl: './approve-advance-payment.component.scss',
})
export class ApproveAdvancePaymentComponent
  implements OnInit, IDialogActionHandler
{
  private readonly advancePaymentService = inject(AdvancePaymentService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly selectedRecord =
    input.required<IAdvancePaymentGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  private advancePaymentId?: string;

  ngOnInit(): void {
    const rows = this.selectedRecord();
    if (!rows?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to approve advance payment but was not provided'
      );
      return;
    }
    this.advancePaymentId = rows[0].id;
  }

  onDialogAccept(): void {
    if (!this.advancePaymentId) {
      return;
    }
    this.executeAdvancePaymentApprovalAction(this.advancePaymentId);
  }

  private executeAdvancePaymentApprovalAction(advancePaymentId: string): void {
    this.loadingService.show({
      title: 'Approving Advance Payment',
      message:
        "We're approving the advance payment. This will just take a moment.",
    });

    this.advancePaymentService
      .approveAdvancePayment({}, advancePaymentId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IApproveAdvancePaymentResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to approve advance payment', error);
          this.notificationService.error('Failed to approve advance payment.');
        },
      });
  }
}
