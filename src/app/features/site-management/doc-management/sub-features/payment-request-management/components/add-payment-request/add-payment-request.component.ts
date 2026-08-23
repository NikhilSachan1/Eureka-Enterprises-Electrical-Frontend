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
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { IInvoiceDropdownRecordDto } from '@features/site-management/doc-management/sub-features/invoice-management/types/invoice.dto';
import { BookPaymentInvoiceSummaryComponent } from '@features/site-management/doc-management/sub-features/book-payment-management/components/book-payment-invoice-summary/book-payment-invoice-summary.component';
import type { IBookPaymentInvoiceDropdownMeta } from '@features/site-management/doc-management/sub-features/book-payment-management/utils/book-payment-invoice-meta.util';

import { ADD_PAYMENT_REQUEST_FORM_CONFIG } from '../../config/form/add-payment-request.config';
import { PaymentRequestService } from '../../services/payment-request.service';
import {
  IAddPaymentRequestFormDto,
  IAddPaymentRequestResponseDto,
  IAddPaymentRequestUIFormDto,
  IPaymentRequestInvoiceDropdownGetRequestDto,
} from '../../types/payment-request.dto';

@Component({
  selector: 'app-add-payment-request',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    InputFieldComponent,
    ReactiveFormsModule,
    BookPaymentInvoiceSummaryComponent,
  ],
  templateUrl: './add-payment-request.component.html',
  styleUrl: './add-payment-request.component.scss',
})
export class AddPaymentRequestComponent
  extends FormBase<IAddPaymentRequestUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly paymentRequestService = inject(PaymentRequestService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  private trackedPaymentRequestInputs!: ITrackedFields<IAddPaymentRequestUIFormDto>;
  private invoiceOptions: IOptionDropdown<IBookPaymentInvoiceDropdownMeta>[] =
    [];

  protected readonly selectedInvoiceMeta =
    signal<IBookPaymentInvoiceDropdownMeta | null>(null);

  protected readonly onSuccess = input.required<() => void>();
  protected readonly docContext = input.required<EDocContext>();
  protected readonly projectName = input<string>();

  constructor() {
    super();
    effect(() => {
      if (
        this.trackedPaymentRequestInputs &&
        this.trackedPaymentRequestInputs.projectName
      ) {
        const siteId = this.trackedPaymentRequestInputs.projectName();
        if (siteId && typeof siteId === 'string') {
          this.loadInvoiceOptions(siteId);
          return;
        }

        this.applyInvoiceOptions([], false);
        this.selectedInvoiceMeta.set(null);
      }
    });
    effect(() => {
      this.trackedPaymentRequestInputs?.invoiceNumber?.();
      this.updateSelectedInvoiceMeta();
    });
  }

  ngOnInit(): void {
    this.form = this.formService.createForm<IAddPaymentRequestUIFormDto>(
      ADD_PAYMENT_REQUEST_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: {
          projectName: this.projectName(),
        },
      }
    );

    this.trackedPaymentRequestInputs =
      this.formService.trackMultipleFieldChanges<IAddPaymentRequestUIFormDto>(
        this.form.formGroup,
        ['projectName', 'invoiceNumber'],
        this.destroyRef
      );
  }

  private loadInvoiceOptions(siteId: string): void {
    this.invoiceOptions = [];
    this.selectedInvoiceMeta.set(null);
    this.form?.patch({ invoiceNumber: undefined });
    this.applyInvoiceOptions([], true);

    const paramData = this.prepareParamDataForInvoiceDropdown(siteId);

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
          this.notificationService.error(
            'Could not load invoices for this project. Please try again.'
          );
          this.applyInvoiceOptions([], false);
        },
      });
  }

  private prepareParamDataForInvoiceDropdown(
    siteId: string
  ): IPaymentRequestInvoiceDropdownGetRequestDto {
    return {
      projectName: siteId,
      docType: this.docContext(),
    };
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
      this.selectedInvoiceMeta.set(matched ?? null);
      return;
    }

    this.selectedInvoiceMeta.set(null);
  }

  private applyInvoiceOptions(options: IOptionDropdown[], loading: boolean): void {
    if (!this.form) {
      return;
    }

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
    const formData = this.prepareFormData();
    this.executeAddPaymentRequestAction(formData);
  }

  private executeAddPaymentRequestAction(
    formData: IAddPaymentRequestFormDto
  ): void {
    this.loadingService.show({
      title: 'Raising payment request',
      message:
        "Please wait while we're raising the payment request. This will just take a moment.",
    });
    this.form.disable();

    this.paymentRequestService
      .addPaymentRequest(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAddPaymentRequestResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to raise payment request', error);
          this.notificationService.error(
            'Could not raise payment request. Please try again.'
          );
        },
      });
  }

  private prepareFormData(): IAddPaymentRequestFormDto {
    const formData = this.form.getData();
    const record = { ...formData };
    delete (record as Record<string, unknown>)['projectName'];
    return record;
  }
}
