import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import { IDialogActionHandler } from '@shared/types';
import { BookPaymentService } from '../../services/book-payment.service';
import { ConfirmationDialogService } from '@shared/services';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import {
  IRejectBookPaymentFormDto,
  IRejectBookPaymentResponseDto,
  IBookPaymentGetBaseResponseDto,
} from '../../types/book-payment.dto';
import { REJECT_ACTION_BOOK_PAYMENT_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-reject-book-payment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './reject-book-payment.component.html',
  styleUrl: './reject-book-payment.component.scss',
})
export class RejectBookPaymentComponent
  extends FormBase<IRejectBookPaymentFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly bookPaymentService = inject(BookPaymentService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IBookPaymentGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to reject book payment but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IRejectBookPaymentFormDto>(
      REJECT_ACTION_BOOK_PAYMENT_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const bookPaymentId = this.selectedRecord()[0].id;
    const formData = this.prepareFormData();
    this.executeBookPaymentRejectAction(formData, bookPaymentId);
  }

  private prepareFormData(): IRejectBookPaymentFormDto {
    return this.form.getData();
  }

  private executeBookPaymentRejectAction(
    formData: IRejectBookPaymentFormDto,
    bookPaymentId: string
  ): void {
    this.loadingService.show({
      title: 'Rejecting book payment',
      message:
        "We're rejecting the book payment. This will just take a moment.",
    });
    this.form.disable();

    this.bookPaymentService
      .rejectBookPayment(formData, bookPaymentId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IRejectBookPaymentResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to reject book payment', error);
          this.notificationService.error('Failed to reject book payment.');
        },
      });
  }
}
