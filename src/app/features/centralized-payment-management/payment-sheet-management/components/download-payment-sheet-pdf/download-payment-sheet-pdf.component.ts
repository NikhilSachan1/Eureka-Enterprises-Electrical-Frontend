import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBase } from '@shared/base/form.base';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ConfirmationDialogService, GalleryService } from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { finalize } from 'rxjs';
import {
  DOWNLOAD_PAYMENT_SHEET_PDF_FORM_CONFIG,
  PAYMENT_SHEET_PDF_DOWNLOAD_ALL,
} from '../../config/form/download-payment-sheet-pdf.config';
import { PaymentSheetService } from '../../services/payment-sheet.service';
import { IDownloadPaymentSheetPdfFormDto } from '../../types/payment-sheet.dto';

@Component({
  selector: 'app-download-payment-sheet-pdf',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './download-payment-sheet-pdf.component.html',
  styleUrl: './download-payment-sheet-pdf.component.scss',
})
export class DownloadPaymentSheetPdfComponent
  extends FormBase<IDownloadPaymentSheetPdfFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly paymentSheetService = inject(PaymentSheetService);
  private readonly galleryService = inject(GalleryService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly paymentSheetId = input.required<string>();

  ngOnInit(): void {
    if (!this.paymentSheetId()) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Payment sheet id is required to download PDF but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IDownloadPaymentSheetPdfFormDto>(
      DOWNLOAD_PAYMENT_SHEET_PDF_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: {
          sourceType: PAYMENT_SHEET_PDF_DOWNLOAD_ALL,
        },
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const paymentSheetId = this.paymentSheetId();
    const { sourceType } = this.prepareFormData();

    if (!paymentSheetId || !sourceType) {
      this.notificationService.error('Select a payment source.');
      return;
    }

    this.form.disable();
    this.loadingService.show({
      title: 'Loading PDF',
      message: 'Preparing payment sheet PDF...',
    });

    this.paymentSheetService
      .getPaymentSheetPdf(
        paymentSheetId,
        sourceType === PAYMENT_SHEET_PDF_DOWNLOAD_ALL
          ? undefined
          : { sourceType }
      )
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.form.enable();
          this.isSubmitting.set(false);
        })
      )
      .subscribe({
        next: response => {
          this.galleryService.show([
            {
              mediaKey: response.key,
              actualMediaUrl: response.url,
            },
          ]);
          this.logger.logUserAction('Payment sheet PDF opened', {
            paymentSheetId,
            sourceType,
          });
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to load payment sheet PDF', error);
          this.notificationService.error(
            'Failed to download payment sheet PDF.'
          );
        },
      });
  }

  private prepareFormData(): IDownloadPaymentSheetPdfFormDto {
    return this.form.getData();
  }
}
