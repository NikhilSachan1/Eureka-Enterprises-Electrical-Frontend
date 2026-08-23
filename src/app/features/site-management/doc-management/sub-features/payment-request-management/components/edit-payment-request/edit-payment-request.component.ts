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
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { IInvoiceDropdownRecordDto } from '@features/site-management/doc-management/sub-features/invoice-management/types/invoice.dto';
import { BookPaymentInvoiceSummaryComponent } from '@features/site-management/doc-management/sub-features/book-payment-management/components/book-payment-invoice-summary/book-payment-invoice-summary.component';
import type { IBookPaymentInvoiceDropdownMeta } from '@features/site-management/doc-management/sub-features/book-payment-management/utils/book-payment-invoice-meta.util';

import { EDIT_PAYMENT_REQUEST_FORM_CONFIG } from '../../config/form/edit-payment-request.config';
import { PaymentRequestService } from '../../services/payment-request.service';
import {
  IEditPaymentRequestFormDto,
  IEditPaymentRequestResponseDto,
  IEditPaymentRequestUIFormDto,
  IPaymentRequestGetBaseResponseDto,
  IPaymentRequestInvoiceDropdownGetRequestDto,
} from '../../types/payment-request.dto';
import { parsePaymentRequestAmount } from '../../utils/payment-request-table-row.util';

@Component({
  selector: 'app-edit-payment-request',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    InputFieldComponent,
    ReactiveFormsModule,
    BookPaymentInvoiceSummaryComponent,
  ],
  templateUrl: './edit-payment-request.component.html',
  styleUrl: './edit-payment-request.component.scss',
})
export class EditPaymentRequestComponent
  extends FormBase<IEditPaymentRequestUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly paymentRequestService = inject(PaymentRequestService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  private trackedPaymentRequestInputs?: ITrackedFields<IEditPaymentRequestUIFormDto>;
  private invoiceOptions: IOptionDropdown<IBookPaymentInvoiceDropdownMeta>[] =
    [];

  protected readonly selectedInvoiceMeta =
    signal<IBookPaymentInvoiceDropdownMeta | null>(null);

  protected readonly selectedRecord =
    input.required<IPaymentRequestGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();
  protected readonly docContext = input.required<EDocContext>();

  constructor() {
    super();
    effect(() => {
      this.trackedPaymentRequestInputs?.invoiceNumber?.();
      this.updateSelectedInvoiceMeta();
    });
  }

  ngOnInit(): void {
    const record = this.selectedRecord()?.[0];
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to edit payment request but was not provided'
      );
      this.confirmationDialogService.closeDialog();
      return;
    }

    const requestedAmount = parsePaymentRequestAmount(record.requestedAmount);

    this.form = this.formService.createForm<IEditPaymentRequestUIFormDto>(
      EDIT_PAYMENT_REQUEST_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: {
          projectName: record.siteId,
          invoiceNumber: record.invoiceId ?? record.invoice?.id,
          requestedAmount: requestedAmount ?? undefined,
          reason: record.reason ?? '',
        },
      }
    );

    this.seedInvoiceNumberOption(record);
    this.selectedInvoiceMeta.set(this.mapRecordInvoiceMeta(record));

    this.trackedPaymentRequestInputs =
      this.formService.trackMultipleFieldChanges<IEditPaymentRequestUIFormDto>(
        this.form.formGroup,
        ['invoiceNumber'],
        this.destroyRef
      );

    this.loadInvoiceOptions(record.siteId);
  }

  private seedInvoiceNumberOption(
    record: IPaymentRequestGetBaseResponseDto
  ): void {
    const invoiceId = record.invoiceId ?? record.invoice?.id;
    if (!invoiceId) {
      return;
    }

    const base = this.form.fieldConfigs.invoiceNumber;
    this.form.fieldConfigs.invoiceNumber = {
      ...base,
      selectConfig: {
        ...base.selectConfig,
        optionsDropdown: [
          {
            label: record.invoice?.invoiceNumber ?? invoiceId,
            value: invoiceId,
          },
        ],
      },
    } as IInputFieldsConfig;
  }

  private loadInvoiceOptions(siteId: string): void {
    this.applyInvoiceOptions(
      this.form.fieldConfigs.invoiceNumber.selectConfig?.optionsDropdown ?? [],
      true
    );

    const paramData: IPaymentRequestInvoiceDropdownGetRequestDto = {
      projectName: siteId,
      docType: this.docContext(),
    };

    this.paymentRequestService
      .getInvoiceDropdown(paramData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          const opts = this.mapInvoiceRecordToOption(response.records);
          this.invoiceOptions = opts;
          this.applyInvoiceOptions(opts, false);
          this.updateSelectedInvoiceMeta();
        },
        error: error => {
          this.logger.error('Failed to load invoice dropdown', error);
          this.applyInvoiceOptions(
            this.form.fieldConfigs.invoiceNumber.selectConfig
              ?.optionsDropdown ?? [],
            false
          );
        },
      });
  }

  private mapInvoiceRecordToOption(
    records: IInvoiceDropdownRecordDto[]
  ): IOptionDropdown<IBookPaymentInvoiceDropdownMeta>[] {
    return records.map(record => ({
      label: record.label,
      value: record.id,
      disabled: !record.eligible,
      disabledReason: record.reason ?? undefined,
      data: record.meta,
    }));
  }

  private mapRecordInvoiceMeta(
    record: IPaymentRequestGetBaseResponseDto
  ): IBookPaymentInvoiceDropdownMeta | null {
    const invoice = record.invoice;
    if (!invoice) {
      return null;
    }

    return {
      taxableAmount: Number(invoice.taxableAmount),
      gstAmount: Number(invoice.gstAmount),
      tdsAmount: Number(invoice.tdsAmount),
      totalAmount: Number(invoice.totalAmount),
    };
  }

  private updateSelectedInvoiceMeta(): void {
    const tracked = this.trackedPaymentRequestInputs;
    if (!tracked) {
      return;
    }

    const invoiceId = tracked.getValues().invoiceNumber;
    if (typeof invoiceId === 'string' && invoiceId.length > 0) {
      const matched = getMappedValueFromArrayOfObjects(
        this.invoiceOptions,
        invoiceId,
        'value',
        'data'
      ) as IBookPaymentInvoiceDropdownMeta | undefined;
      this.selectedInvoiceMeta.set(
        matched ?? this.mapRecordInvoiceMeta(this.selectedRecord()[0])
      );
      return;
    }

    this.selectedInvoiceMeta.set(null);
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

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const paymentRequestId = this.selectedRecord()[0]?.id;
    if (!paymentRequestId) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }

    this.executeEditPaymentRequestAction(
      paymentRequestId,
      this.prepareFormData()
    );
  }

  private prepareFormData(): IEditPaymentRequestFormDto {
    const formData = this.form.getData();
    const record = { ...formData };
    delete (record as Record<string, unknown>)['projectName'];
    delete (record as Record<string, unknown>)['invoiceNumber'];
    return record;
  }

  private executeEditPaymentRequestAction(
    paymentRequestId: string,
    formData: IEditPaymentRequestFormDto
  ): void {
    this.loadingService.show({
      title: 'Updating payment request',
      message:
        'Please wait while we update the payment request. This will just take a moment.',
    });
    this.form.disable();

    this.paymentRequestService
      .editPaymentRequest(formData, paymentRequestId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IEditPaymentRequestResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to edit payment request', error);
          this.notificationService.error(
            'Could not update payment request. Please try again.'
          );
        },
      });
  }
}
