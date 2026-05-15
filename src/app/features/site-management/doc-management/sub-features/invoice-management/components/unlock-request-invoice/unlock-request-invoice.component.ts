import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import { IDialogActionHandler } from '@shared/types';
import { InvoiceService } from '../../services/invoice.service';
import { ConfirmationDialogService } from '@shared/services';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import {
  IUnlockRequestInvoiceFormDto,
  IUnlockRequestInvoiceResponseDto,
  IInvoiceGetBaseResponseDto,
} from '../../types/invoice.dto';
import { UNLOCK_REQUEST_ACTION_INVOICE_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-unlock-request-invoice',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './unlock-request-invoice.component.html',
  styleUrl: './unlock-request-invoice.component.scss',
})
export class UnlockRequestInvoiceComponent
  extends FormBase<IUnlockRequestInvoiceFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly invoiceService = inject(InvoiceService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IInvoiceGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to request invoice unlock but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IUnlockRequestInvoiceFormDto>(
      UNLOCK_REQUEST_ACTION_INVOICE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const invoiceId = this.selectedRecord()[0].id;
    const formData = this.prepareFormData();
    this.executeUnlockRequestAction(formData, invoiceId);
  }

  private prepareFormData(): IUnlockRequestInvoiceFormDto {
    return this.form.getData();
  }

  private executeUnlockRequestAction(
    formData: IUnlockRequestInvoiceFormDto,
    invoiceId: string
  ): void {
    this.loadingService.show({
      title: 'Requesting unlock',
      message:
        "We're submitting your unlock request. This will just take a moment.",
    });
    this.form.disable();

    this.invoiceService
      .unlockRequestInvoice(formData, invoiceId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IUnlockRequestInvoiceResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to request invoice unlock', error);
          this.notificationService.error('Failed to request invoice unlock.');
        },
      });
  }
}
