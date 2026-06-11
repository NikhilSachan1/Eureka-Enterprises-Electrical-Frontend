import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
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
import { BookPaymentInvoiceSummaryComponent } from '../book-payment-invoice-summary/book-payment-invoice-summary.component';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { InvoiceService } from '@features/site-management/doc-management/sub-features/invoice-management/services/invoice.service';
import {
  IInvoiceDropdownGetRequestDto,
  IInvoiceDropdownRecordDto,
} from '@features/site-management/doc-management/sub-features/invoice-management/types/invoice.dto';
import {
  applyProjectDateRangeFromSite,
  IProjectSiteDateRange,
} from '@features/site-management/project-management/utility/project-overview-date.util';

import { EDIT_BOOK_PAYMENT_FORM_CONFIG } from '../../config';
import { BookPaymentService } from '../../services/book-payment.service';
import {
  IBookPaymentGetBaseResponseDto,
  IEditBookPaymentFormDto,
  IEditBookPaymentResponseDto,
  IEditBookPaymentUIFormDto,
} from '../../types/book-payment.dto';
import {
  BOOK_PAYMENT_FORM_CONTEXT_KEYS,
  IBookPaymentInvoiceDropdownMeta,
  isBookPaymentHoldReasonRequired,
} from '../../utils/book-payment-invoice-meta.util';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';

@Component({
  selector: 'app-edit-book-payment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    InputFieldComponent,
    ReactiveFormsModule,
    BookPaymentInvoiceSummaryComponent,
  ],
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
  private invoiceOptions: IOptionDropdown<IBookPaymentInvoiceDropdownMeta>[] =
    [];

  private readonly formContext: Record<string, unknown> = {
    [BOOK_PAYMENT_FORM_CONTEXT_KEYS.invoiceRemaining]: null,
  };

  protected readonly selectedInvoiceMeta =
    signal<IBookPaymentInvoiceDropdownMeta | null>(null);

  protected readonly showPaymentHoldReason = computed(() => {
    const meta = this.selectedInvoiceMeta();
    const amount = this.trackedBookPaymentInputs?.paymentTotalAmount?.();
    return isBookPaymentHoldReasonRequired(amount, meta?.remaining);
  });

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
      this.trackedBookPaymentInputs?.invoiceNumber?.();
      this.updateSelectedInvoiceMeta();
    });
    effect(() => {
      this.trackedBookPaymentInputs?.paymentTotalAmount?.();
      this.selectedInvoiceMeta();
      this.refreshPaymentHoldReasonValidators();
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
          paymentTotalAmount: Number(record.paymentTotalAmount),
          paymentHoldReason: record.paymentHoldReason ?? null,
          remarks: record.remarks ?? null,
        },
        context: this.formContext,
      }
    );

    this.seedInvoiceNumberOption(record);

    applyProjectDateRangeFromSite(
      this.form,
      'bookingDate',
      EDIT_BOOK_PAYMENT_FORM_CONFIG.fields.bookingDate.dateConfig,
      record.site as IProjectSiteDateRange
    );
    queueMicrotask(() => this.changeDetectorRef.detectChanges());

    this.trackedBookPaymentInputs =
      this.formService.trackMultipleFieldChanges<IEditBookPaymentUIFormDto>(
        this.form.formGroup,
        ['projectName', 'invoiceNumber', 'paymentTotalAmount'],
        this.destroyRef
      );
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
    this.invoiceOptions = [];
    this.applyInvoiceOptions([], true);

    const paramData = this.prepareParamDataForInvoiceDropdown(siteId);

    this.invoiceService
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
  ): IInvoiceDropdownGetRequestDto {
    return {
      projectName: siteId,
      docType: this.docContext(),
      forDocument: 'book-payment',
    };
  }

  private mapInvoiceRecordToOption(
    records: IInvoiceDropdownRecordDto[]
  ): IOptionDropdown<IBookPaymentInvoiceDropdownMeta>[] {
    return records.map(r => ({
      label: r.label,
      value: r.id,
      disabled: !r.eligible,
      disabledReason: r.reason ?? undefined,
      data: r.meta,
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

  private updateSelectedInvoiceMeta(): void {
    const tracked = this.trackedBookPaymentInputs;
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
      this.syncInvoiceRemainingContext(matched?.remaining);
      return;
    }

    this.selectedInvoiceMeta.set(null);
    this.syncInvoiceRemainingContext(undefined);
  }

  private syncInvoiceRemainingContext(remaining: number | undefined): void {
    this.formContext[BOOK_PAYMENT_FORM_CONTEXT_KEYS.invoiceRemaining] =
      remaining ?? null;
    this.refreshPaymentHoldReasonValidators();
  }

  private refreshPaymentHoldReasonValidators(): void {
    if (!this.form?.formGroup) {
      return;
    }

    this.formService.refreshConditionalValidators(
      this.form.formGroup,
      this.form.fieldConfigs,
      this.formContext
    );
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

    const formData = this.prepareFormData();
    this.executeEditBookPaymentAction(record.id, formData);
  }

  private executeEditBookPaymentAction(
    bookPaymentId: string,
    formData: IEditBookPaymentFormDto
  ): void {
    this.loadingService.show({
      title: 'Updating book payment',
      message:
        'Please wait while we update the book payment. This will just take a moment.',
    });
    this.form.disable();

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
