import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { FormBase } from '@shared/base/form.base';
import {
  IDialogActionHandler,
  IInputFieldsConfig,
  IOptionDropdown,
  ITrackedFields,
} from '@shared/types';
import { ConfirmationDialogService } from '@shared/services';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { InvoiceService } from '@features/site-management/doc-management/sub-features/invoice-management/services/invoice.service';
import {
  IInvoiceDropdownGetRequestDto,
  IInvoiceDropdownRecordDto,
} from '@features/site-management/doc-management/sub-features/invoice-management/types/invoice.dto';
import { roundCurrencyAmount } from '@shared/utility';

import { ADD_BOOK_PAYMENT_FORM_CONFIG } from '../../config';
import { BookPaymentService } from '../../services/book-payment.service';
import {
  IAddBookPaymentFormDto,
  IAddBookPaymentResponseDto,
  IAddBookPaymentUIFormDto,
} from '../../types/book-payment.dto';

@Component({
  selector: 'app-add-book-payment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './add-book-payment.component.html',
  styleUrl: './add-book-payment.component.scss',
})
export class AddBookPaymentComponent
  extends FormBase<IAddBookPaymentUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly bookPaymentService = inject(BookPaymentService);
  private readonly invoiceService = inject(InvoiceService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  private trackedBookPaymentInputs!: ITrackedFields<IAddBookPaymentUIFormDto>;

  protected readonly onSuccess = input.required<() => void>();
  protected readonly docContext = input.required<EDocContext>();

  constructor() {
    super();
    effect(() => {
      if (
        this.trackedBookPaymentInputs &&
        this.trackedBookPaymentInputs.projectName
      ) {
        const siteId = this.trackedBookPaymentInputs.projectName();
        if (siteId && typeof siteId === 'string') {
          this.loadInvoiceOptions(siteId);
        }
      }
    });
    effect(() => {
      const tracked = this.trackedBookPaymentInputs;
      tracked?.taxableAmount?.();
      tracked?.gstPercentage?.();
      tracked?.tdsPercentage?.();
      this.recalcGstTdsAndPaymentTotal();
    });
  }

  ngOnInit(): void {
    this.form = this.formService.createForm<IAddBookPaymentUIFormDto>(
      ADD_BOOK_PAYMENT_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    const trackedFields: (keyof IAddBookPaymentUIFormDto)[] = [
      'projectName',
      'taxableAmount',
      'gstPercentage',
      'tdsPercentage',
    ];

    this.trackedBookPaymentInputs =
      this.formService.trackMultipleFieldChanges<IAddBookPaymentUIFormDto>(
        this.form.formGroup,
        trackedFields,
        this.destroyRef
      );
  }

  private loadInvoiceOptions(siteId: string): void {
    this.applyInvoiceOptions([], true);

    const paramData = this.prepareParamDataForInvoiceDropdown(siteId);

    this.invoiceService
      .getInvoiceDropdown(paramData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          const opts = this.mapInvoiceRecordToOption(response.records);
          this.applyInvoiceOptions(opts, false);
        },
        error: error => {
          this.logger.error('Failed to load invoice dropdown', error);
          this.notificationService.error(
            'Could not load invoices for this project. Please try again.'
          );
          this.applyInvoiceOptions([], false);
        },
      });
  }

  private prepareParamDataForInvoiceDropdown(
    siteId: string
  ): IInvoiceDropdownGetRequestDto {
    return {
      projectName: siteId,
      docType: this.docContext(),
    };
  }

  private mapInvoiceRecordToOption(
    records: IInvoiceDropdownRecordDto[]
  ): IOptionDropdown[] {
    return records.map(record => ({
      label: record.label,
      value: record.id,
      disabled: !record.eligible,
      disabledReason: record.reason ?? undefined,
    }));
  }

  private applyInvoiceOptions(
    options: IOptionDropdown[],
    loading: boolean
  ): void {
    const base = this.form.fieldConfigs.invoiceNumber;
    this.form.fieldConfigs.invoiceNumber = {
      ...base,
      selectConfig: {
        ...base.selectConfig,
        optionsDropdown: options,
        loading,
      },
    } as IInputFieldsConfig;

    queueMicrotask(() => this.changeDetectorRef.detectChanges());
  }

  private recalcGstTdsAndPaymentTotal(): void {
    const tracked = this.trackedBookPaymentInputs;
    if (!tracked) {
      return;
    }
    const { taxableAmount, gstPercentage, tdsPercentage } = tracked.getValues();
    const taxable =
      taxableAmount === null || taxableAmount === undefined
        ? NaN
        : Number(taxableAmount);
    const gstP =
      gstPercentage === null || gstPercentage === undefined
        ? NaN
        : Number(gstPercentage);
    const tdsP =
      tdsPercentage === null || tdsPercentage === undefined
        ? NaN
        : Number(tdsPercentage);

    if (isNaN(taxable) || isNaN(gstP) || isNaN(tdsP)) {
      return;
    }

    const gstAmt = roundCurrencyAmount(taxable * (gstP / 100));
    const tdsAmt = roundCurrencyAmount(taxable * (tdsP / 100));
    const payTotal = roundCurrencyAmount(taxable - gstAmt - tdsAmt);

    this.form.formGroup.patchValue({
      gstAmount: gstAmt,
      tdsDeductionAmount: tdsAmt,
      paymentTotalAmount: payTotal,
    });
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    this.executeAddBookPaymentAction();
  }

  private executeAddBookPaymentAction(): void {
    this.loadingService.show({
      title: 'Adding book payment',
      message:
        "Please wait while we're adding the book payment. This will just take a moment.",
    });
    this.form.disable();

    const formData = this.prepareFormData();

    this.bookPaymentService
      .addBookPayment(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAddBookPaymentResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to add book payment', error);
          this.notificationService.error(
            'Could not add book payment. Please try again.'
          );
        },
      });
  }

  private prepareFormData(): IAddBookPaymentFormDto {
    const formData = this.form.getData();
    const record = { ...formData };
    delete (record as Record<string, unknown>)['projectName'];
    return record;
  }
}
