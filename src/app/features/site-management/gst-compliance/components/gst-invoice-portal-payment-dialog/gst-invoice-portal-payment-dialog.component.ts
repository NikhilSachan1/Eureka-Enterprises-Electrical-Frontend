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

  protected proofFile: File | null = null;

  protected readonly paymentForm = new FormGroup({
    utrNumber: new FormControl('', [
      Validators.required,
      Validators.minLength(12),
    ]),
    paymentDate: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    const existing = this.existingRecord();
    this.paymentForm.reset({
      utrNumber: existing?.utrNumber ?? '',
      paymentDate: existing?.paymentDate ?? '',
    });
  }

  onDialogAccept(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }
    const { utrNumber, paymentDate } = this.paymentForm.getRawValue();
    const existing = this.existingRecord();
    const existingProof = existing?.proofFileName ?? '';
    const proofName = this.proofFile?.name ?? existingProof;

    this.storage.saveInvoicePortalPayment({
      invoiceId: this.invoiceId(),
      billNo: this.billNo(),
      monthKey: this.monthKey(),
      partyKey: this.partyKey(),
      flow: this.flow(),
      utrNumber: utrNumber ?? '',
      paymentDate: paymentDate ?? '',
      proofFileName: proofName,
    });
    this.onSuccess()();
    this.confirmationDialogService.closeDialog();
  }

  protected onProofSelected(event: Event): void {
    const el = event.target as HTMLInputElement;
    this.proofFile = el.files?.[0] ?? null;
  }

  protected isInvalid(field: 'utrNumber' | 'paymentDate'): boolean {
    const ctrl = this.paymentForm.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  protected existingProofLabel(): string | null {
    const name = this.existingRecord()?.proofFileName?.trim();
    return name !== undefined && name !== '' ? name : null;
  }
}
