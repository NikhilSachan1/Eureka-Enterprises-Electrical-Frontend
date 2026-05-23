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
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { InvoiceService } from '@features/site-management/doc-management/sub-features/invoice-management/services/invoice.service';
import {
  IInvoiceDropdownGetRequestDto,
  IInvoiceDropdownRecordDto,
} from '@features/site-management/doc-management/sub-features/invoice-management/types/invoice.dto';
import { roundCurrencyAmount } from '@shared/utility';

import { EDIT_BOOK_PAYMENT_FORM_CONFIG } from '../../config';
import { BookPaymentService } from '../../services/book-payment.service';
import {
  IBookPaymentGetBaseResponseDto,
  IEditBookPaymentFormDto,
  IEditBookPaymentResponseDto,
  IEditBookPaymentUIFormDto,
} from '../../types/book-payment.dto';

@Component({
  selector: 'app-edit-book-payment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './edit-book-payment.component.html',
  styleUrl: './edit-book-payment.component.scss',
})
export class EditBookPaymentComponent
  extends FormBase<IEditBookPaymentUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly bookPaymentService = inject(BookPaymentService);
  private readonly invoiceService = inject(InvoiceService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  private trackedBookPaymentInputs!: ITrackedFields<IEditBookPaymentUIFormDto>;

  private allowGstTdsAutoRecalc = false;

  private prefilledTaxableAmount: number | null = null;
  private prefilledGstPercentage: number | null = null;
  private prefilledTdsPercentage: number | null = null;

  protected readonly selectedRecord =
    input.required<IBookPaymentGetBaseResponseDto[]>();
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
      const taxable = tracked?.taxableAmount?.();
      const gstPercentage = tracked?.gstPercentage?.();
      const tdsPercentage = tracked?.tdsPercentage?.();
      const { prefilledTaxableAmount } = this;
      const { prefilledGstPercentage } = this;
      const { prefilledTdsPercentage } = this;
      if (
        prefilledTaxableAmount !== null &&
        prefilledGstPercentage !== null &&
        prefilledTdsPercentage !== null &&
        tracked !== undefined
      ) {
        if (
          taxable !== prefilledTaxableAmount ||
          gstPercentage !== prefilledGstPercentage ||
          tdsPercentage !== prefilledTdsPercentage
        ) {
          this.allowGstTdsAutoRecalc = true;
        }
      }
      this.recalcGstTdsAndPaymentTotal();
    });
  }

  ngOnInit(): void {
    const rows = this.selectedRecord();
    const record = rows?.[0];
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error('Edit Book Payment: selected record was not provided');
      this.confirmationDialogService.closeDialog();
      return;
    }

    this.form = this.formService.createForm<IEditBookPaymentUIFormDto>(
      EDIT_BOOK_PAYMENT_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: {
          projectName: record.siteId,
          invoiceNumber: record.invoiceId,
          bookingDate: new Date(record.bookingDate),
          taxableAmount: Number(record.taxableAmount),
          gstPercentage: Number(record.gstPercentage),
          gstAmount: Number(record.gstAmount),
          tdsPercentage: Number(record.tdsPercentage),
          tdsDeductionAmount: Number(record.tdsDeductionAmount),
          paymentTotalAmount: Number(record.paymentTotalAmount),
          paymentHoldReason: record.paymentHoldReason ?? null,
          remarks: record.remarks ?? null,
        },
      }
    );

    this.seedInvoiceNumberOption(record);

    const trackedFields: (keyof IEditBookPaymentUIFormDto)[] = [
      'projectName',
      'taxableAmount',
      'gstPercentage',
      'tdsPercentage',
    ];

    this.trackedBookPaymentInputs =
      this.formService.trackMultipleFieldChanges<IEditBookPaymentUIFormDto>(
        this.form.formGroup,
        trackedFields,
        this.destroyRef
      );

    const { taxableAmount, gstPercentage, tdsPercentage } =
      this.trackedBookPaymentInputs.getValues();
    this.prefilledTaxableAmount =
      taxableAmount === null || taxableAmount === undefined
        ? null
        : Number(taxableAmount);
    this.prefilledGstPercentage =
      gstPercentage === null || gstPercentage === undefined
        ? null
        : Number(gstPercentage);
    this.prefilledTdsPercentage =
      tdsPercentage === null || tdsPercentage === undefined
        ? null
        : Number(tdsPercentage);
  }

  private seedInvoiceNumberOption(
    record: IBookPaymentGetBaseResponseDto
  ): void {
    const base = this.form.fieldConfigs.invoiceNumber;
    const label = record.invoice?.invoiceNumber ?? record.invoiceId;
    this.form.fieldConfigs.invoiceNumber = {
      ...base,
      selectConfig: {
        ...base.selectConfig,
        optionsDropdown: [
          {
            label,
            value: record.invoiceId,
          },
        ],
      },
    } as IInputFieldsConfig;
    queueMicrotask(() => this.changeDetectorRef.detectChanges());
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
    return records.map(r => ({
      label: r.label,
      value: r.id,
      disabled: !r.eligible,
      disabledReason: r.reason ?? undefined,
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
    if (!this.form) {
      return;
    }
    const tracked = this.trackedBookPaymentInputs;
    if (!tracked || !this.allowGstTdsAutoRecalc) {
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
    const record = this.selectedRecord()[0];
    if (!record?.id) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }

    this.executeEditBookPaymentAction(record.id);
  }

  private executeEditBookPaymentAction(bookPaymentId: string): void {
    this.loadingService.show({
      title: 'Updating book payment',
      message:
        'Please wait while we update the book payment. This will just take a moment.',
    });
    this.form.disable();

    const formData = this.prepareFormData();

    this.bookPaymentService
      .editBookPayment(formData, bookPaymentId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IEditBookPaymentResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to edit book payment', error);
          this.notificationService.error(
            'Could not update book payment. Please try again.'
          );
        },
      });
  }

  private prepareFormData(): IEditBookPaymentFormDto {
    const formData = this.form.getData();
    const record = { ...formData };
    delete (record as Record<string, unknown>)['projectName'];
    delete (record as Record<string, unknown>)['invoiceNumber'];
    return record;
  }
}
