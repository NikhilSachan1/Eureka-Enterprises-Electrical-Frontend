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
  IBankTransferDocAddFormDto,
  IBankTransferDocAddUIFormDto,
} from '../../types/doc.dto';
import {
  IDialogActionHandler,
  IFormConfig,
  IOptionDropdown,
} from '@shared/types';
import {
  DocIndexedDbService,
  IDocIndexedDbRow,
} from '../../services/doc-indexed-db.service';
import { ConfirmationDialogService } from '@shared/services';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { BANK_TRANSFER_DOC_FORM_CONFIG } from '../../config';
import { EDocType } from '../../types/doc.enum';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DocRefChainComponent } from '../doc-ref-chain/doc-ref-chain.component';

@Component({
  selector: 'app-bank-transfer-doc',
  imports: [
    CurrencyPipe,
    InputFieldComponent,
    ReactiveFormsModule,
    DocRefChainComponent,
  ],
  templateUrl: './bank-transfer-doc.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankTransferDocComponent
  extends FormBase<IBankTransferDocAddUIFormDto>
  implements OnInit, IDialogActionHandler
{
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
  protected readonly lockedAmount = signal<number | null>(null);

  ngOnInit(): void {
    void this.docIndexedDbService
      .getDocNumberOptions(
        EDocType.PAYMENT_ADVICE,
        this.docContext(),
        EDocType.BANK_TRANSFER
      )
      .then(paOptions => {
        this.form = this.formService.createForm<IBankTransferDocAddUIFormDto>(
          this.buildFormConfig(paOptions),
          { destroyRef: this.destroyRef }
        );
        this.prefillIfEditing();

        // When PA is selected, prefill & lock the transfer amount from PA's amount
        this.form.formGroup
          .get('paymentAdviceRef')
          ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(val => {
            const paId = val as string | null;
            this.selectedRefDocId.set(paId);
            void this.applyPaAmount(paId);
          });

        const editRef = this.editRecord()?.docReference;
        if (editRef) {
          this.selectedRefDocId.set(editRef);
          void this.applyPaAmount(editRef);
        }
        this.cdr.markForCheck();
      });
  }

  private async applyPaAmount(paId: string | null): Promise<void> {
    const amountCtrl = this.form.formGroup.get('transferTotalAmount');
    if (!amountCtrl) {
      return;
    }
    if (!paId) {
      this.lockedAmount.set(null);
      amountCtrl.enable();
      amountCtrl.reset();
      this.cdr.markForCheck();
      return;
    }
    // PA itself stores no amount — walk up to the parent Payment draft to get the amount
    const pa = await this.docIndexedDbService.getDocById(paId);
    const sourceDoc =
      pa?.totalAmount !== null
        ? pa
        : pa?.docReference
          ? await this.docIndexedDbService.getDocById(pa.docReference)
          : null;

    if (sourceDoc?.totalAmount !== null && sourceDoc) {
      this.lockedAmount.set(sourceDoc.totalAmount);
      amountCtrl.setValue(sourceDoc.totalAmount);
      amountCtrl.disable();
    }
    this.cdr.markForCheck();
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeDocActionIndexedDb(formData);
  }

  private prefillIfEditing(): void {
    const rec = this.editRecord();
    if (!rec) {
      return;
    }
    this.form.patch({
      paymentAdviceRef: rec.docReference ?? undefined,
      utrNumber: rec.documentNumber,
      transferDate: rec.documentDate ? new Date(rec.documentDate) : undefined,
      transferTotalAmount: rec.totalAmount ?? undefined,
      transferRemark: rec.remark ?? undefined,
    } as Partial<IBankTransferDocAddUIFormDto>);
  }

  private prepareFormData(): IBankTransferDocAddFormDto {
    // getRawValue() includes disabled controls (transferTotalAmount is disabled after PA selection)
    return {
      ...(this.form.formGroup.getRawValue() as IBankTransferDocAddUIFormDto),
      docContext: this.docContext(),
    };
  }

  private buildFormConfig(
    paOptions: IOptionDropdown[]
  ): IFormConfig<IBankTransferDocAddUIFormDto> {
    return {
      ...BANK_TRANSFER_DOC_FORM_CONFIG,
      fields: {
        ...BANK_TRANSFER_DOC_FORM_CONFIG.fields,
        paymentAdviceRef: {
          ...BANK_TRANSFER_DOC_FORM_CONFIG.fields.paymentAdviceRef,
          selectConfig: { optionsDropdown: paOptions },
        },
      },
    };
  }

  private executeDocActionIndexedDb(
    formData: IBankTransferDocAddFormDto
  ): void {
    const existing = this.editRecord();
    const action = existing
      ? this.docIndexedDbService.updateBankTransferDoc(existing, formData)
      : this.docIndexedDbService.addBankTransferDoc(formData);

    this.loadingService.show({
      title: existing ? 'Updating Bank Transfer' : 'Adding Bank Transfer',
      message: 'Please wait…',
    });
    this.form.disable();
    void action
      .then(() => {
        this.notificationService.success(
          existing
            ? 'Bank Transfer updated successfully'
            : 'Bank Transfer saved successfully'
        );
        this.onSuccess()();
        this.confirmationDialogService.closeDialog();
      })
      .catch((error: unknown) => {
        this.logger.error('Bank Transfer IndexedDB operation failed', error);
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
