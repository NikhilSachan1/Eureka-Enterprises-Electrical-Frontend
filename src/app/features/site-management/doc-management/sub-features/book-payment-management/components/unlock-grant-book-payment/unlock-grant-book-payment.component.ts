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
import { BookPaymentService } from '../../services/book-payment.service';
import {
  IUnlockGrantBookPaymentResponseDto,
  IBookPaymentGetBaseResponseDto,
} from '../../types/book-payment.dto';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-unlock-grant-book-payment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './unlock-grant-book-payment.component.html',
  styleUrl: './unlock-grant-book-payment.component.scss',
})
export class UnlockGrantBookPaymentComponent
  implements OnInit, IDialogActionHandler
{
  private readonly bookPaymentService = inject(BookPaymentService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly selectedRecord =
    input.required<IBookPaymentGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  private bookPaymentId?: string;

  ngOnInit(): void {
    const rows = this.selectedRecord();
    if (!rows?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to grant book payment unlock but was not provided'
      );
      return;
    }
    this.bookPaymentId = rows[0].id;
  }

  onDialogAccept(): void {
    if (!this.bookPaymentId) {
      return;
    }
    this.executeBookPaymentUnlockGrantAction(this.bookPaymentId);
  }

  private executeBookPaymentUnlockGrantAction(bookPaymentId: string): void {
    this.loadingService.show({
      title: 'Granting unlock',
      message:
        "We're granting unlock for this book payment. This will just take a moment.",
    });

    this.bookPaymentService
      .unlockGrantBookPayment(bookPaymentId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IUnlockGrantBookPaymentResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to grant book payment unlock', error);
          this.notificationService.error(
            'Failed to grant book payment unlock.'
          );
        },
      });
  }
}
