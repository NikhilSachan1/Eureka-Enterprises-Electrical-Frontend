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
  IUnlockRequestBookPaymentFormDto,
  IUnlockRequestBookPaymentResponseDto,
  IBookPaymentGetBaseResponseDto,
} from '../../types/book-payment.dto';
import { UNLOCK_REQUEST_ACTION_BOOK_PAYMENT_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-unlock-request-book-payment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './unlock-request-book-payment.component.html',
  styleUrl: './unlock-request-book-payment.component.scss',
})
export class UnlockRequestBookPaymentComponent
  extends FormBase<IUnlockRequestBookPaymentFormDto>
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
        'Selected record is required to request book payment unlock but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IUnlockRequestBookPaymentFormDto>(
      UNLOCK_REQUEST_ACTION_BOOK_PAYMENT_FORM_CONFIG,
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
    this.executeUnlockRequestAction(formData, bookPaymentId);
  }

  private prepareFormData(): IUnlockRequestBookPaymentFormDto {
    return this.form.getData();
  }

  private executeUnlockRequestAction(
    formData: IUnlockRequestBookPaymentFormDto,
    bookPaymentId: string
  ): void {
    this.loadingService.show({
      title: 'Requesting unlock',
      message:
        "We're submitting your unlock request. This will just take a moment.",
    });
    this.form.disable();

    this.bookPaymentService
      .unlockRequestBookPayment(formData, bookPaymentId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IUnlockRequestBookPaymentResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to request book payment unlock', error);
          this.notificationService.error(
            'Failed to request book payment unlock.'
          );
        },
      });
  }
}
