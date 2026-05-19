import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { FormBase } from '@shared/base/form.base';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ConfirmationDialogService, GalleryService } from '@shared/services';
import { IGalleryInputData, IDialogActionHandler } from '@shared/types';

import { SEND_EMAIL_BANK_TRANSFER_FORM_CONFIG } from '../../config/form/send-email-bank-transfer.config';
import { BankTransferService } from '../../services/bank-transfer.service';
import {
  ISendEmailBankTransferFormDto,
  ISendEmailBankTransferResponseDto,
  ISendEmailBankTransferUIFormDto,
  ISendEmailPaymentAdviceRecordDto,
} from '../../types/bank-transfer.dto';

@Component({
  selector: 'app-send-email-payment-advice',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './send-email-payment-advice.component.html',
  styleUrl: './send-email-payment-advice.component.scss',
})
export class SendEmailPaymentAdviceComponent
  extends FormBase<ISendEmailBankTransferUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly bankTransferService = inject(BankTransferService);
  private readonly galleryService = inject(GalleryService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  protected readonly selectedRecord =
    input.required<ISendEmailPaymentAdviceRecordDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  private paymentAdviceId?: string;
  private pdfKey?: string;

  protected readonly pdfFileName = signal<string | null>(null);

  ngOnInit(): void {
    const rows = this.selectedRecord();
    if (!rows?.length) {
      this.notificationService.error('No payment advice selected.');
      return;
    }

    const record = rows[0];
    this.paymentAdviceId = record.id;
    this.pdfKey = record.pdfKey ?? undefined;
    const vendorEmail = record.vendor.email?.trim() ?? '';

    if (record.pdfKey) {
      this.pdfFileName.set(`${record.referenceNumber.replace(/\//g, '-')}.pdf`);
    }

    this.form = this.formService.createForm<ISendEmailBankTransferUIFormDto>(
      SEND_EMAIL_BANK_TRANSFER_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: {
          to: vendorEmail ? [vendorEmail] : [],
          cc: [],
          subject: `Payment Advice - ${record.referenceNumber}`,
          body: '',
        },
      }
    );

    this.form.formGroup.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.changeDetectorRef.markForCheck());
  }

  protected openPdfPreview(): void {
    if (!this.pdfKey) {
      return;
    }
    const media: IGalleryInputData[] = [
      { mediaKey: this.pdfKey, actualMediaUrl: '' },
    ];
    this.galleryService.show(media);
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    if (!this.paymentAdviceId) {
      return;
    }
    this.executeSendEmailAction(this.paymentAdviceId);
  }

  private executeSendEmailAction(paymentAdviceId: string): void {
    this.loadingService.show({
      title: 'Sending email',
      message: 'Please wait while we send the payment advice email.',
    });
    this.form.disable();

    const formData = this.prepareFormData();

    this.bankTransferService
      .sendPaymentAdviceEmail(paymentAdviceId, formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ISendEmailBankTransferResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to send payment advice email', error);
          this.notificationService.error(
            'Could not send payment advice email. Please try again.'
          );
        },
      });
  }

  private prepareFormData(): ISendEmailBankTransferFormDto {
    const formData = this.form.getData();
    return {
      ...formData,
      attachmentKeys: this.pdfKey ? [this.pdfKey] : [],
    };
  }
}
