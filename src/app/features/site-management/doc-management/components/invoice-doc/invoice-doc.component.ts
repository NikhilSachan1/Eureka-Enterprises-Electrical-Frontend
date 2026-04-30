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
  IInvoiceDocAddFormDto,
  IInvoiceDocAddResponseDto,
  IInvoiceDocAddUIFormDto,
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
import { INVOICE_DOC_FORM_CONFIG } from '../../config';
import { EDocType } from '../../types/doc.enum';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DocRefChainComponent } from '../doc-ref-chain/doc-ref-chain.component';

@Component({
  selector: 'app-invoice-doc',
  imports: [
    CurrencyPipe,
    InputFieldComponent,
    ReactiveFormsModule,
    DocRefChainComponent,
  ],
  templateUrl: './invoice-doc.component.html',
  styleUrl: './invoice-doc.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceDocComponent
  extends FormBase<IInvoiceDocAddUIFormDto>
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
  protected readonly docContext = input.required<'sales' | 'purchase'>();
  protected readonly onSuccess = input.required<() => void>();
  protected readonly editRecord = input<IDocIndexedDbRow | null>(null);

  protected get isEditMode(): boolean {
    return !!this.editRecord();
  }
  protected readonly selectedRefDocId = signal<string | null>(null);
  protected readonly gstPercent = signal<number | null>(18);

  protected readonly poBillingSummary = signal<{
    poTotal: number;
    alreadyInvoiced: number;
    remaining: number;
  } | null>(null);

  ngOnInit(): void {
    void this.docIndexedDbService
      .getDocNumberOptions(EDocType.JMC, this.docContext(), EDocType.INVOICE)
      .then(jmcOptions => {
        this.form = this.formService.createForm<IInvoiceDocAddUIFormDto>(
          this.buildFormConfig(jmcOptions),
          { destroyRef: this.destroyRef }
        );
        this.prefillIfEditing();
        // Auto-recalculate GST when taxable amount changes
        this.form.formGroup
          .get('invoiceTaxableAmount')
          ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.applyGstPercent();
            this.applyTotal();
          });
        this.form.formGroup
          .get('invoiceGstAmount')
          ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.applyTotal());
        this.form.formGroup
          .get('jmcNumber')
          ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(val => {
            this.selectedRefDocId.set(val as string | null);
            void this.loadPoBillingSummary(val as string | null);
          });
        const editRef = this.editRecord()?.docReference;
        if (editRef) {
          this.selectedRefDocId.set(editRef);
          void this.loadPoBillingSummary(editRef);
        }
        this.cdr.markForCheck();
      });
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    const summary = this.poBillingSummary();
    if (summary) {
      const enteredAmount = formData.invoiceTotalAmount ?? 0;
      if (enteredAmount > summary.remaining) {
        this.notificationService.error(
          `Invoice amount ₹${enteredAmount.toLocaleString('en-IN')} exceeds PO billing balance ₹${summary.remaining.toLocaleString('en-IN')}.`
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

  private applyGstPercent(): void {
    const pct = this.gstPercent();
    if (pct === null) {
      return;
    }
    const taxable = this.form.formGroup.get('invoiceTaxableAmount')?.value as
      | number
      | null;
    if (taxable === null || taxable === undefined) {
      return;
    }
    const gst = Math.round(taxable * pct) / 100;
    this.form.formGroup.get('invoiceGstAmount')?.setValue(gst);
  }

  private applyTotal(): void {
    const taxable =
      (this.form.formGroup.get('invoiceTaxableAmount')?.value as number) ?? 0;
    const gst =
      (this.form.formGroup.get('invoiceGstAmount')?.value as number) ?? 0;
    this.form.formGroup.get('invoiceTotalAmount')?.setValue(taxable + gst);
  }

  private async loadPoBillingSummary(jmcId: string | null): Promise<void> {
    if (!jmcId) {
      this.poBillingSummary.set(null);
      return;
    }
    const allDocs = await this.docIndexedDbService.getAllDocs();
    // Walk up to find PO
    const jmc = allDocs.find(d => d.id === jmcId);
    const po = jmc?.docReference
      ? allDocs.find(d => d.id === jmc.docReference)
      : null;
    if (!po) {
      this.poBillingSummary.set(null);
      return;
    }
    // All JMCs under this PO
    const jmcIds = allDocs
      .filter(d => d.documentType === EDocType.JMC && d.docReference === po.id)
      .map(d => d.id);
    // All invoices under those JMCs, excluding the record being edited
    const editingId = this.editRecord()?.id;
    const existingInvoices = allDocs.filter(
      d =>
        d.documentType === EDocType.INVOICE &&
        jmcIds.includes(d.docReference ?? '') &&
        d.id !== editingId
    );
    const poTotal = po.totalAmount ?? 0;
    const alreadyInvoiced = existingInvoices.reduce(
      (s, i) => s + (i.totalAmount ?? 0),
      0
    );
    this.poBillingSummary.set({
      poTotal,
      alreadyInvoiced,
      remaining: poTotal - alreadyInvoiced,
    });
    this.cdr.markForCheck();
  }

  private prefillIfEditing(): void {
    const rec = this.editRecord();
    if (!rec) {
      return;
    }
    this.form.patch({
      jmcNumber: rec.docReference ?? undefined,
      invoiceNumber: rec.documentNumber,
      invoiceDate: rec.documentDate ? new Date(rec.documentDate) : undefined,
      invoiceTaxableAmount: rec.taxableAmount ?? undefined,
      invoiceGstAmount: rec.gstAmount ?? undefined,
      invoiceTotalAmount: rec.totalAmount ?? undefined,
      invoiceRemark: rec.remark ?? undefined,
    } as Partial<IInvoiceDocAddUIFormDto>);
  }

  private prepareFormData(): IInvoiceDocAddFormDto {
    return { ...this.form.getData(), docContext: this.docContext() };
  }

  private buildFormConfig(
    jmcOptions: IOptionDropdown[]
  ): IFormConfig<IInvoiceDocAddUIFormDto> {
    return {
      ...INVOICE_DOC_FORM_CONFIG,
      fields: {
        ...INVOICE_DOC_FORM_CONFIG.fields,
        jmcNumber: {
          ...INVOICE_DOC_FORM_CONFIG.fields.jmcNumber,
          selectConfig: { optionsDropdown: jmcOptions },
        },
      },
    };
  }

  private executeDocAction(formData: IInvoiceDocAddFormDto): void {
    this.loadingService.show({
      title: 'Adding Invoice Document',
      message:
        "We're adding the Invoice document. This will just take a moment.",
    });
    this.form.disable();
    this.docService
      .addInvoiceDoc(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IInvoiceDocAddResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
      });
  }

  private executeDocActionIndexedDb(formData: IInvoiceDocAddFormDto): void {
    const existing = this.editRecord();
    const action = existing
      ? this.docIndexedDbService.updateInvoiceDoc(existing, formData)
      : this.docIndexedDbService.addInvoiceDoc(formData);

    this.loadingService.show({
      title: existing ? 'Updating Invoice Document' : 'Adding Invoice Document',
      message: 'Please wait...',
    });
    this.form.disable();
    void action
      .then(() => {
        this.notificationService.success(
          existing
            ? 'Invoice document updated successfully'
            : 'Invoice document saved successfully'
        );
        this.onSuccess()();
        this.confirmationDialogService.closeDialog();
      })
      .catch((error: unknown) => {
        this.logger.error('Invoice doc IndexedDB operation failed', error);
        this.notificationService.error(
          FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
        );
      })
      .finally(() => {
        this.loadingService.hide();
        this.isSubmitting.set(false);
        this.form.enable();
      });
  }
}
