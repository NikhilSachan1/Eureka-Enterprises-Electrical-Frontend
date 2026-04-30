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
  IPaymentAdviceDocAddFormDto,
  IPaymentAdviceDocAddResponseDto,
  IPaymentAdviceDocAddUIFormDto,
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
import { PAYMENT_ADVICE_DOC_FORM_CONFIG } from '../../config';
import { EDocType } from '../../types/doc.enum';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DocRefChainComponent } from '../doc-ref-chain/doc-ref-chain.component';

@Component({
  selector: 'app-payment-advice-doc',
  imports: [InputFieldComponent, ReactiveFormsModule, DocRefChainComponent],
  templateUrl: './payment-advice-doc.component.html',
  styleUrl: './payment-advice-doc.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentAdviceDocComponent
  extends FormBase<IPaymentAdviceDocAddUIFormDto>
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

  ngOnInit(): void {
    void this.docIndexedDbService
      .getDocNumberOptions(
        EDocType.PAYMENT,
        this.docContext(),
        EDocType.PAYMENT_ADVICE
      )
      .then(paymentOptions => {
        this.form = this.formService.createForm<IPaymentAdviceDocAddUIFormDto>(
          this.buildFormConfig(paymentOptions),
          {
            destroyRef: this.destroyRef,
            context: { docContext: this.docContext() },
          }
        );
        this.prefillIfEditing();
        this.form.formGroup
          .get('transactionNumber')
          ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(val => this.selectedRefDocId.set(val as string | null));
        const editRef = this.editRecord()?.docReference;
        if (editRef) {
          this.selectedRefDocId.set(editRef);
        }
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
      transactionNumber: rec.docReference ?? undefined,
      paymentAdviceNumber: rec.documentNumber,
      paymentAdviceDate: rec.documentDate
        ? new Date(rec.documentDate)
        : undefined,
      paymentAdviceRemark: rec.remark ?? undefined,
    } as Partial<IPaymentAdviceDocAddUIFormDto>);
  }

  private prepareFormData(): IPaymentAdviceDocAddFormDto {
    return { ...this.form.getData(), docContext: this.docContext() };
  }

  private buildFormConfig(
    paymentOptions: IOptionDropdown[]
  ): IFormConfig<IPaymentAdviceDocAddUIFormDto> {
    return {
      ...PAYMENT_ADVICE_DOC_FORM_CONFIG,
      fields: {
        ...PAYMENT_ADVICE_DOC_FORM_CONFIG.fields,
        transactionNumber: {
          ...PAYMENT_ADVICE_DOC_FORM_CONFIG.fields.transactionNumber,
          selectConfig: { optionsDropdown: paymentOptions },
        },
      },
    };
  }

  private executeDocAction(formData: IPaymentAdviceDocAddFormDto): void {
    const actionWord =
      this.docContext() === 'purchase' ? 'Generating' : 'Adding';
    this.loadingService.show({
      title: `${actionWord} Payment Advice Document`,
      message: 'Please wait...',
    });
    this.form.disable();
    this.docService
      .addPaymentAdviceDoc(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IPaymentAdviceDocAddResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
      });
  }

  private generatePurchaseDefaults(
    formData: IPaymentAdviceDocAddFormDto
  ): IPaymentAdviceDocAddFormDto {
    if (formData.docContext !== 'purchase') {
      return formData;
    }
    const randomSuffix = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
    const dummyFile = new File(
      ['[Auto-generated payment advice for purchase]'],
      `PA-${randomSuffix}.pdf`,
      { type: 'application/pdf' }
    );
    return {
      ...formData,
      paymentAdviceNumber: formData.paymentAdviceNumber || `PA-${randomSuffix}`,
      paymentAdviceAttachments: formData.paymentAdviceAttachments?.length
        ? formData.paymentAdviceAttachments
        : [dummyFile],
    };
  }

  private executeDocActionIndexedDb(
    formData: IPaymentAdviceDocAddFormDto
  ): void {
    const resolved = this.generatePurchaseDefaults(formData);
    const existing = this.editRecord();
    const action = existing
      ? this.docIndexedDbService.updatePaymentAdviceDoc(existing, resolved)
      : this.docIndexedDbService.addPaymentAdviceDoc(resolved);

    this.loadingService.show({
      title: existing ? 'Updating Payment Advice' : 'Adding Payment Advice',
      message: 'Please wait...',
    });
    this.form.disable();
    void action
      .then(() => {
        this.notificationService.success(
          existing
            ? 'Payment advice updated successfully'
            : 'Payment advice saved successfully'
        );
        this.onSuccess()();
        this.confirmationDialogService.closeDialog();
      })
      .catch(error => {
        this.logger.error(
          'Payment advice doc IndexedDB operation failed',
          error
        );
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
