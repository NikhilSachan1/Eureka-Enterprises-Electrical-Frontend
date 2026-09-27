import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
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
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { BookPaymentInvoiceSummaryComponent } from '@features/site-management/doc-management/sub-features/book-payment-management/components/book-payment-invoice-summary/book-payment-invoice-summary.component';
import type { IDocMetricSummaryRow } from '@features/site-management/doc-management/sub-features/book-payment-management/components/book-payment-invoice-summary/book-payment-invoice-summary.component';
import { AdvancePaymentService } from '@features/site-management/doc-management/sub-features/advance-payment-management/services/advance-payment.service';
import {
  IAdvancePaymentDropdownGetResponseDto,
  IAdvancePaymentDropdownRecordDto,
} from '@features/site-management/doc-management/sub-features/advance-payment-management/types/advance-payment.dto';
import { parseAdvancePaymentAmount } from '@features/site-management/doc-management/sub-features/advance-payment-management/utils/advance-payment-table-row.util';
import { SETTLE_ADVANCE_INVOICE_FORM_CONFIG } from '../../config/form/settle-advance-invoice.config';
import { InvoiceService } from '../../services/invoice.service';
import {
  IInvoiceGetBaseResponseDto,
  ISettleAdvanceInvoiceFormDto,
  ISettleAdvanceInvoiceResponseDto,
} from '../../types/invoice.dto';

@Component({
  selector: 'app-settle-advance-invoice',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    InputFieldComponent,
    ReactiveFormsModule,
    BookPaymentInvoiceSummaryComponent,
  ],
  templateUrl: './settle-advance-invoice.component.html',
})
export class SettleAdvanceInvoiceComponent
  extends FormBase<ISettleAdvanceInvoiceFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly invoiceService = inject(InvoiceService);
  private readonly advancePaymentService = inject(AdvancePaymentService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  protected readonly selectedRecord =
    input.required<IInvoiceGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  private trackedSettleInputs?: ITrackedFields<ISettleAdvanceInvoiceFormDto>;
  private advanceOptions: IOptionDropdown<
    IAdvancePaymentDropdownRecordDto['meta']
  >[] = [];

  protected readonly selectedAdvanceMeta = signal<
    IAdvancePaymentDropdownRecordDto['meta'] | null
  >(null);

  constructor() {
    super();
    effect(() => {
      this.trackedSettleInputs?.advanceNumber?.();
      this.updateSelectedAdvanceMeta();
    });
  }

  ngOnInit(): void {
    const record = this.selectedRecord()?.[0];
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to settle advance but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<ISettleAdvanceInvoiceFormDto>(
      SETTLE_ADVANCE_INVOICE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    this.trackedSettleInputs =
      this.formService.trackMultipleFieldChanges<ISettleAdvanceInvoiceFormDto>(
        this.form.formGroup,
        ['advanceNumber'],
        this.destroyRef
      );

    this.loadAdvanceOptions(record.id);
  }

  protected advanceSummaryRows(
    meta: IAdvancePaymentDropdownRecordDto['meta']
  ): IDocMetricSummaryRow[] {
    return [
      {
        title: 'Advance',
        items: [
          { label: 'Amount', value: meta.amount ?? 0, tone: 'booked' },
          { label: 'Settled', value: meta.settledAmount ?? 0, tone: 'paid' },
          {
            label: 'Balance',
            value: meta.balanceAmount ?? 0,
            tone: 'remaining',
          },
          {
            label: 'Max this invoice',
            value: meta.maxSettleableAmount ?? 0,
            tone: 'total',
          },
        ],
      },
    ];
  }

  private loadAdvanceOptions(invoiceId: string): void {
    this.applyAdvanceOptions([], true);

    this.advancePaymentService
      .getAdvancePaymentDropdown({ invoiceId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: IAdvancePaymentDropdownGetResponseDto) => {
          this.advanceOptions = this.mapAdvanceRecordToOption(response.records);
          this.applyAdvanceOptions(this.advanceOptions, false);
          this.updateSelectedAdvanceMeta();
        },
        error: error => {
          this.logger.error('Failed to load advance dropdown', error);
          this.applyAdvanceOptions([], false);
        },
      });
  }

  private mapAdvanceRecordToOption(
    records: IAdvancePaymentDropdownRecordDto[]
  ): IOptionDropdown<IAdvancePaymentDropdownRecordDto['meta']>[] {
    return records.map(record => ({
      label: record.label,
      value: record.id,
      disabled: !record.eligible,
      disabledReason: record.reason ?? undefined,
      data: record.meta,
    }));
  }

  private applyAdvanceOptions(
    options: IOptionDropdown[],
    loading: boolean
  ): void {
    if (!this.form) {
      return;
    }

    const base = this.form.fieldConfigs.advanceNumber;
    this.form.fieldConfigs.advanceNumber = {
      ...base,
      selectConfig: {
        ...base.selectConfig,
        optionsDropdown: options,
        loading,
      },
    } as IInputFieldsConfig;

    queueMicrotask(() => this.changeDetectorRef.detectChanges());
  }

  private updateSelectedAdvanceMeta(): void {
    const tracked = this.trackedSettleInputs;
    if (!tracked || !this.form) {
      return;
    }

    const advanceNumber = tracked.getValues().advanceNumber;
    if (typeof advanceNumber === 'string' && advanceNumber.length > 0) {
      const matched = getMappedValueFromArrayOfObjects(
        this.advanceOptions,
        advanceNumber,
        'value',
        'data'
      ) as IAdvancePaymentDropdownRecordDto['meta'] | undefined;
      this.selectedAdvanceMeta.set(matched ?? null);
      this.applySettleAmountCap(matched?.maxSettleableAmount);
      return;
    }

    this.selectedAdvanceMeta.set(null);
    this.applySettleAmountCap(null);
  }

  private applySettleAmountCap(maxSettleableAmount: unknown): void {
    const maxAmount = parseAdvancePaymentAmount(maxSettleableAmount);
    const amountControl = this.form.formGroup.get('amount');
    const validators = [Validators.required, Validators.min(0.01)];
    if (maxAmount !== null && maxAmount > 0) {
      validators.push(Validators.max(maxAmount));
    }
    amountControl?.setValidators(validators);
    amountControl?.updateValueAndValidity({ emitEvent: false });

    const base = this.form.fieldConfigs.amount;
    this.form.fieldConfigs.amount = {
      ...base,
      numberConfig: {
        ...base.numberConfig,
        maximumBoundaryValue: maxAmount ?? undefined,
      },
    } as IInputFieldsConfig;

    if (maxAmount !== null && maxAmount > 0) {
      const current = parseAdvancePaymentAmount(amountControl?.value);
      if (current === null) {
        this.form.patch({ amount: maxAmount });
      } else if (current > maxAmount) {
        this.form.patch({ amount: maxAmount });
      }
    }

    queueMicrotask(() => this.changeDetectorRef.detectChanges());
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const invoiceId = this.selectedRecord()[0]?.id;
    if (!invoiceId) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }
    this.executeSettleAction(invoiceId, this.form.getData());
  }

  private executeSettleAction(
    invoiceId: string,
    formData: ISettleAdvanceInvoiceFormDto
  ): void {
    this.loadingService.show({
      title: 'Settling advance',
      message:
        "We're applying this advance against the invoice. This will just take a moment.",
    });
    this.form.disable();

    this.invoiceService
      .settleAdvance(invoiceId, formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ISettleAdvanceInvoiceResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to settle advance', error);
        },
      });
  }
}
