import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { IDialogActionHandler } from '@shared/types';
import { ConfirmationDialogService } from '@shared/services';
import {
  GstPortalPaymentStorageService,
  IGstInvoicePaymentRecord,
  IGstPartyFlow,
} from '../../services/gst-portal-payment-storage.service';

@Component({
  selector: 'app-gst-invoice-portal-payment-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './gst-invoice-portal-payment-dialog.component.html',
  styleUrl: './gst-invoice-portal-payment-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GstInvoicePortalPaymentDialogComponent
  implements OnInit, IDialogActionHandler
{
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly storage = inject(GstPortalPaymentStorageService);

  protected readonly monthLabel = input.required<string>();
  protected readonly partyName = input.required<string>();
  protected readonly monthKey = input.required<string>();
  protected readonly invoiceId = input.required<string>();
  protected readonly billNo = input.required<string>();
  protected readonly gstAmount = input.required<number>();
  protected readonly partyKey = input.required<string>();
  protected readonly flow = input.required<IGstPartyFlow>();
  protected readonly existingRecord = input<IGstInvoicePaymentRecord | null>(
    null
  );
  protected readonly onSuccess = input.required<() => void>();

  protected readonly verifyForm = new FormGroup({
    verifiedDate: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    const existing = this.existingRecord();
    this.verifyForm.reset({
      verifiedDate: existing?.paymentDate ?? '',
    });
  }

  onDialogAccept(): void {
    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
      return;
    }
    const verifiedDate = this.verifyForm.getRawValue().verifiedDate ?? '';

    this.storage.saveInvoiceGstVerification({
      invoiceId: this.invoiceId(),
      billNo: this.billNo(),
      monthKey: this.monthKey(),
      partyKey: this.partyKey(),
      flow: this.flow(),
      verifiedDate,
    });
    this.onSuccess()();
    this.confirmationDialogService.closeDialog();
  }

  protected isInvalid(): boolean {
    const ctrl = this.verifyForm.get('verifiedDate');
    return !!(ctrl?.invalid && ctrl.touched);
  }
}
