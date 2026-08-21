import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { FormBase } from '@shared/base/form.base';
import { IDialogActionHandler, IInputFieldsConfig } from '@shared/types';
import { ConfirmationDialogService } from '@shared/services';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';

import { EDIT_PAYMENT_REQUEST_FORM_CONFIG } from '../../config/form/edit-payment-request.config';
import { PaymentRequestService } from '../../services/payment-request.service';
import {
  IEditPaymentRequestFormDto,
  IEditPaymentRequestResponseDto,
  IEditPaymentRequestUIFormDto,
  IPaymentRequestGetBaseResponseDto,
} from '../../types/payment-request.dto';
import { parsePaymentRequestAmount } from '../../utils/payment-request-table-row.util';

@Component({
  selector: 'app-edit-payment-request',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './edit-payment-request.component.html',
  styleUrl: './edit-payment-request.component.scss',
})
export class EditPaymentRequestComponent
  extends FormBase<IEditPaymentRequestUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly paymentRequestService = inject(PaymentRequestService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IPaymentRequestGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord()?.[0];
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to edit payment request but was not provided'
      );
      this.confirmationDialogService.closeDialog();
      return;
    }

    const requestedAmount = parsePaymentRequestAmount(record.requestedAmount);

    this.form = this.formService.createForm<IEditPaymentRequestUIFormDto>(
      EDIT_PAYMENT_REQUEST_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: {
          projectName: record.siteId,
          invoiceNumber: record.invoiceId ?? record.invoice?.id,
          requestedAmount: requestedAmount ?? undefined,
          reason: record.reason ?? null,
        },
      }
    );

    this.seedInvoiceNumberOption(record);
  }

  private seedInvoiceNumberOption(
    record: IPaymentRequestGetBaseResponseDto
  ): void {
    const invoiceId = record.invoiceId ?? record.invoice?.id;
    if (!invoiceId) {
      return;
    }

    const base = this.form.fieldConfigs.invoiceNumber;
    this.form.fieldConfigs.invoiceNumber = {
      ...base,
      selectConfig: {
        ...base.selectConfig,
        optionsDropdown: [
          {
            label: record.invoice?.invoiceNumber ?? invoiceId,
            value: invoiceId,
          },
        ],
      },
    } as IInputFieldsConfig;
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const paymentRequestId = this.selectedRecord()[0]?.id;
    if (!paymentRequestId) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }

    this.executeEditPaymentRequestAction(
      paymentRequestId,
      this.prepareFormData()
    );
  }

  private prepareFormData(): IEditPaymentRequestFormDto {
    const formData = this.form.getData();
    const record = { ...formData };
    delete (record as Record<string, unknown>)['projectName'];
    delete (record as Record<string, unknown>)['invoiceNumber'];
    return record;
  }

  private executeEditPaymentRequestAction(
    paymentRequestId: string,
    formData: IEditPaymentRequestFormDto
  ): void {
    this.loadingService.show({
      title: 'Updating payment request',
      message:
        'Please wait while we update the payment request. This will just take a moment.',
    });
    this.form.disable();

    this.paymentRequestService
      .editPaymentRequest(formData, paymentRequestId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IEditPaymentRequestResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to edit payment request', error);
          this.notificationService.error(
            'Could not update payment request. Please try again.'
          );
        },
      });
  }
}
