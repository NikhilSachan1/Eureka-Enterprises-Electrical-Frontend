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
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-doc',
  imports: [InputFieldComponent, ReactiveFormsModule],
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
      invoiceNumber: rec.docReference ?? undefined,
      transactionNumber: rec.documentNumber,
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
      title: 'Adding Payment Document',
      message:
        "We're adding the Payment document. This will just take a moment.",
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
      title: existing ? 'Updating Payment Document' : 'Adding Payment Document',
      message: 'Please wait...',
    });
    this.form.disable();
    void action
      .then(() => {
        this.notificationService.success(
          existing
            ? 'Payment document updated successfully'
            : 'Payment document saved successfully'
        );
        this.onSuccess()();
        this.confirmationDialogService.closeDialog();
      })
      .catch(error => {
        this.logger.error('Payment doc IndexedDB operation failed', error);
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
