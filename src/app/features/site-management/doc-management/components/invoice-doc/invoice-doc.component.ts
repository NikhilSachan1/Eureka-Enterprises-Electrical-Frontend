import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  OnInit,
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
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-invoice-doc',
  imports: [InputFieldComponent, ReactiveFormsModule],
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

  ngOnInit(): void {
    void this.docIndexedDbService
      .getDocNumberOptions(EDocType.JMC, this.docContext(), EDocType.INVOICE)
      .then(jmcOptions => {
        this.form = this.formService.createForm<IInvoiceDocAddUIFormDto>(
          this.buildFormConfig(jmcOptions),
          { destroyRef: this.destroyRef }
        );
        this.prefillIfEditing();
        this.cdr.markForCheck();
      });
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    // this.executeDocAction(formData);
    this.executeDocActionIndexedDb(formData);
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
