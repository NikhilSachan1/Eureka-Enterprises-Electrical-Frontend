import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import {
  IDocGetBaseResponseDto,
  IPaymentDocAddFormDto,
  IPaymentDocAddResponseDto,
  IPaymentDocAddUIFormDto,
} from '../../types/doc.dto';
import {
  IDialogActionHandler,
  IFormConfig,
  IOptionDropdown,
} from '@shared/types';
import { DocService } from '../../services/doc.service';
import {
  DocIndexedDbService,
  IDocIndexedDbRow,
} from '../../services/doc-indexed-db.service';
import { ConfirmationDialogService } from '@shared/services';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { PAYMENT_DOC_FORM_CONFIG } from '../../config';
import { EDocType } from '../../types/doc.enum';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DocRefChainComponent } from '../doc-ref-chain/doc-ref-chain.component';

@Component({
  selector: 'app-payment-doc',
  imports: [
    CurrencyPipe,
    InputFieldComponent,
    ReactiveFormsModule,
    DocRefChainComponent,
  ],
  templateUrl: './payment-doc.component.html',
  styleUrl: './payment-doc.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentDocComponent
  extends FormBase<IPaymentDocAddUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly docService = inject(DocService);
  private readonly docIndexedDbService = inject(DocIndexedDbService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly selectedRecord =
    input.required<IDocGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();
  protected readonly docContext = input.required<'sales' | 'purchase'>();
  protected readonly editRecord = input<IDocIndexedDbRow | null>(null);

  protected get isEditMode(): boolean {
    return !!this.editRecord();
  }
  protected readonly selectedRefDocId = signal<string | null>(null);
  protected readonly gstPercent = signal<number | null>(18);
  protected readonly tdsPercent = signal<number | null>(2);

  /** One snapshot for this invoice: bill, net paid on earlier drafts, deductions */
  protected readonly invoicePaymentSummary = signal<{
    invoiceNet: number;
    invoiceTaxable: number;
    /** Taxable cap left for this draft line */
    leftTaxableForDraft: number;
    earlierDraftCount: number;
    netPaidEarlier: number;
    gstEarlier: number;
    tdsEarlier: number;
  } | null>(null);

  ngOnInit(): void {
    void this.docIndexedDbService
      .getDocNumberOptions(
        EDocType.INVOICE,
        this.docContext(),
        EDocType.PAYMENT
      )
      .then(invoiceOptions => {
        this.form = this.formService.createForm<IPaymentDocAddUIFormDto>(
          this.buildFormConfig(invoiceOptions),
          { destroyRef: this.destroyRef }
        );
        this.prefillIfEditing();
        // Auto-recalculate GST/TDS when taxable amount changes
        this.form.formGroup
          .get('paymentTaxableAmount')
          ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.applyGstPercent();
            this.applyTdsPercent();
            this.applyTotal();
          });
        this.form.formGroup
          .get('paymentGstAmount')
          ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.applyTotal());
        this.form.formGroup
          .get('paymentTdsDeductionAmount')
          ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.applyTotal());
        this.form.formGroup
          .get('invoiceNumber')
          ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(val => {
            this.selectedRefDocId.set(val as string | null);
            void this.loadInvoicePaymentSummary(val as string | null);
          });
        const editRef = this.editRecord()?.docReference;
        if (editRef) {
          this.selectedRefDocId.set(editRef);
          void this.loadInvoicePaymentSummary(editRef);
        }
        this.cdr.markForCheck();
      });
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    const summary = this.invoicePaymentSummary();
    if (summary) {
      const thisWork = formData.paymentTaxableAmount ?? 0;
      if (thisWork > summary.leftTaxableForDraft) {
        this.notificationService.error(
          `Taxable amount ₹${thisWork.toLocaleString('en-IN')} is too much — only ₹${summary.leftTaxableForDraft.toLocaleString('en-IN')} left (invoice taxable ₹${summary.invoiceTaxable.toLocaleString('en-IN')} − already on drafts).`
        );
        this.isSubmitting.set(false);
        return;
      }
    }
    // this.executeDocAction(formData);
    this.executeDocActionIndexedDb(formData);
  }

  protected updateGstPercent(pct: number | null): void {
    this.gstPercent.set(pct);
    this.applyGstPercent();
  }

  protected updateTdsPercent(pct: number | null): void {
    this.tdsPercent.set(pct);
    this.applyTdsPercent();
  }

  private applyGstPercent(): void {
    const pct = this.gstPercent();
    if (pct === null) {
      return;
    }
    const taxable = this.form.formGroup.get('paymentTaxableAmount')?.value as
      | number
      | null;
    if (taxable === null || taxable === undefined) {
      return;
    }
    const gst = Math.round(taxable * pct) / 100;
    this.form.formGroup.get('paymentGstAmount')?.setValue(gst);
  }

  private applyTdsPercent(): void {
    const pct = this.tdsPercent();
    if (pct === null) {
      return;
    }
    const taxable = this.form.formGroup.get('paymentTaxableAmount')?.value as
      | number
      | null;
    if (taxable === null || taxable === undefined) {
      return;
    }
    const tds = Math.round(taxable * pct) / 100;
    this.form.formGroup.get('paymentTdsDeductionAmount')?.setValue(tds);
  }

  private applyTotal(): void {
    const taxable =
      (this.form.formGroup.get('paymentTaxableAmount')?.value as number) ?? 0;
    const gst =
      (this.form.formGroup.get('paymentGstAmount')?.value as number) ?? 0;
    const tds =
      (this.form.formGroup.get('paymentTdsDeductionAmount')?.value as number) ??
      0;
    this.form.formGroup
      .get('paymentTotalAmount')
      ?.setValue(taxable - gst - tds);
  }

  private async loadInvoicePaymentSummary(
    invoiceId: string | null
  ): Promise<void> {
    if (!invoiceId) {
      this.invoicePaymentSummary.set(null);
      return;
    }
    const allDocs = await this.docIndexedDbService.getAllDocs();
    const invoice = allDocs.find(d => d.id === invoiceId);
    const editingId = this.editRecord()?.id;
    const payments = allDocs.filter(
      d =>
        d.documentType === EDocType.PAYMENT &&
        d.docReference === invoiceId &&
        d.id !== editingId
    );
    const invoiceNet = invoice?.totalAmount ?? 0;
    const invoiceTaxable = invoice?.taxableAmount ?? 0;
    const sumTaxableEarlier = payments.reduce(
      (s, p) => s + (p.taxableAmount ?? 0),
      0
    );
    const sumGstEarlier = payments.reduce((s, p) => s + (p.gstAmount ?? 0), 0);
    const sumTdsEarlier = payments.reduce(
      (s, p) => s + (p.tdsDeductionAmount ?? 0),
      0
    );
    const netPaidEarlier = payments.reduce(
      (s, p) => s + (p.totalAmount ?? 0),
      0
    );
    const taxableCap = invoiceTaxable > 0 ? invoiceTaxable : invoiceNet;
    const leftTaxableForDraft = Math.max(0, taxableCap - sumTaxableEarlier);
    if (invoiceTaxable > 0 && (invoice?.gstAmount ?? 0) >= 0) {
      const pct = ((invoice?.gstAmount ?? 0) / invoiceTaxable) * 100;
      this.gstPercent.set(Math.round(pct * 100) / 100);
    }
    this.invoicePaymentSummary.set({
      invoiceNet,
      invoiceTaxable: taxableCap,
      leftTaxableForDraft,
      earlierDraftCount: payments.length,
      netPaidEarlier,
      gstEarlier: sumGstEarlier,
      tdsEarlier: sumTdsEarlier,
    });
    this.cdr.markForCheck();
  }

  private prefillIfEditing(): void {
    const rec = this.editRecord();
    if (!rec) {
      return;
    }
    this.form.patch({
      invoiceNumber: rec.docReference ?? undefined,
      paymentDate: rec.documentDate ? new Date(rec.documentDate) : undefined,
      paymentTaxableAmount: rec.taxableAmount ?? undefined,
      paymentGstAmount: rec.gstAmount ?? undefined,
      paymentTdsDeductionAmount: rec.tdsDeductionAmount ?? undefined,
      paymentTotalAmount: rec.totalAmount ?? undefined,
      paymentRemark: rec.remark ?? undefined,
    } as Partial<IPaymentDocAddUIFormDto>);
  }

  private prepareFormData(): IPaymentDocAddFormDto {
    return { ...this.form.getData(), docContext: this.docContext() };
  }

  private buildFormConfig(
    invoiceOptions: IOptionDropdown[]
  ): IFormConfig<IPaymentDocAddUIFormDto> {
    return {
      ...PAYMENT_DOC_FORM_CONFIG,
      fields: {
        ...PAYMENT_DOC_FORM_CONFIG.fields,
        invoiceNumber: {
          ...PAYMENT_DOC_FORM_CONFIG.fields.invoiceNumber,
          selectConfig: { optionsDropdown: invoiceOptions },
        },
      },
    };
  }

  private executeDocAction(formData: IPaymentDocAddFormDto): void {
    this.loadingService.show({
      title: 'Booking Payment',
      message: 'Recording this payment against the invoice.',
    });
    this.form.disable();
    this.docService
      .addPaymentDoc(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IPaymentDocAddResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
      });
  }

  private executeDocActionIndexedDb(formData: IPaymentDocAddFormDto): void {
    const existing = this.editRecord();
    const action = existing
      ? this.docIndexedDbService.updatePaymentDoc(existing, formData)
      : this.docIndexedDbService.addPaymentDoc(formData);

    this.loadingService.show({
      title: existing ? 'Updating Payment' : 'Booking Payment',
      message: 'Please wait...',
    });
    this.form.disable();
    void action
      .then(() => {
        this.notificationService.success(
          existing
            ? 'Payment updated successfully'
            : 'Payment booked successfully'
        );
        this.onSuccess()();
        this.confirmationDialogService.closeDialog();
      })
      .catch((error: unknown) => {
        this.logger.error('Payment doc IndexedDB operation failed', error);
        const msg =
          error instanceof Error
            ? error.message
            : FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG;
        this.notificationService.error(msg);
      })
      .finally(() => {
        this.loadingService.hide();
        this.isSubmitting.set(false);
        this.form.enable();
      });
  }
}
