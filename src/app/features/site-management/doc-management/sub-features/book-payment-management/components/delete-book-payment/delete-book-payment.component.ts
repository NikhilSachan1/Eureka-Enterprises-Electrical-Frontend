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
import { BookPaymentService } from '../../services/book-payment.service';
import {
  IBookPaymentGetBaseResponseDto,
  IDeleteBookPaymentResponseDto,
} from '../../types/book-payment.dto';

@Component({
  selector: 'app-delete-book-payment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './delete-book-payment.component.html',
  styleUrl: './delete-book-payment.component.scss',
})
export class DeleteBookPaymentComponent
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
        'Selected record is required to delete book payment but was not provided'
      );
      return;
    }
    this.bookPaymentId = rows[0].id;
  }

  onDialogAccept(): void {
    if (!this.bookPaymentId) {
      return;
    }
    this.executeBookPaymentDeleteAction(this.bookPaymentId);
  }

  private executeBookPaymentDeleteAction(bookPaymentId: string): void {
    this.loadingService.show({
      title: 'Deleting book payment',
      message: "We're removing the book payment. This will just take a moment.",
    });

    this.bookPaymentService
      .deleteBookPayment(bookPaymentId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IDeleteBookPaymentResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to delete book payment', error);
          this.notificationService.error('Failed to delete book payment.');
        },
      });
  }
}
