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
import { BookPaymentInvoiceSummaryComponent } from '../book-payment-invoice-summary/book-payment-invoice-summary.component';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { InvoiceService } from '@features/site-management/doc-management/sub-features/invoice-management/services/invoice.service';
import {
  IInvoiceDropdownGetRequestDto,
  IInvoiceDropdownRecordDto,
} from '@features/site-management/doc-management/sub-features/invoice-management/types/invoice.dto';
import { ProjectService } from '@features/site-management/project-management/services/project.service';
import { IProjectOverviewGetResponseDto } from '@features/site-management/project-management/types/project.dto';
import {
  applyProjectDateRangeFromOverview,
  resetProjectDateField,
  setProjectDateFieldLoading,
} from '@features/site-management/project-management/utility/project-overview-date.util';

import { ADD_BOOK_PAYMENT_FORM_CONFIG } from '../../config';
import { BookPaymentService } from '../../services/book-payment.service';
import {
  IAddBookPaymentFormDto,
  IAddBookPaymentResponseDto,
  IAddBookPaymentUIFormDto,
} from '../../types/book-payment.dto';
import { IBookPaymentInvoiceDropdownMeta } from '../../utils/book-payment-invoice-meta.util';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';

@Component({
  selector: 'app-add-book-payment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    InputFieldComponent,
    ReactiveFormsModule,
    BookPaymentInvoiceSummaryComponent,
  ],
  templateUrl: './add-book-payment.component.html',
  styleUrl: './add-book-payment.component.scss',
})
export class AddBookPaymentComponent
  extends FormBase<IAddBookPaymentUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly bookPaymentService = inject(BookPaymentService);
  private readonly invoiceService = inject(InvoiceService);
  private readonly projectService = inject(ProjectService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  private trackedBookPaymentInputs!: ITrackedFields<IAddBookPaymentUIFormDto>;
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
        this.trackedBookPaymentInputs &&
        this.trackedBookPaymentInputs.projectName
      ) {
        const siteId = this.trackedBookPaymentInputs.projectName();
        if (siteId && typeof siteId === 'string') {
          this.loadProjectDateRange(siteId);
          this.loadInvoiceOptions(siteId);
          return;
        }

        this.resetBookingDateField();
      }
    });
    effect(() => {
      this.trackedBookPaymentInputs?.invoiceNumber?.();
      this.updateSelectedInvoiceMeta();
    });
  }

  ngOnInit(): void {
    this.form = this.formService.createForm<IAddBookPaymentUIFormDto>(
      ADD_BOOK_PAYMENT_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: {
          projectName: this.projectName(),
        },
      }
    );

    const trackedFields: (keyof IAddBookPaymentUIFormDto)[] = [
      'projectName',
      'invoiceNumber',
    ];

    this.trackedBookPaymentInputs =
      this.formService.trackMultipleFieldChanges<IAddBookPaymentUIFormDto>(
        this.form.formGroup,
        trackedFields,
        this.destroyRef
      );
  }

  private loadProjectDateRange(projectId: string): void {
    setProjectDateFieldLoading(this.form, 'bookingDate', true);
    queueMicrotask(() => this.changeDetectorRef.detectChanges());

    this.projectService
      .getProjectOverview(projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: IProjectOverviewGetResponseDto) => {
          applyProjectDateRangeFromOverview(
            this.form,
            'bookingDate',
            ADD_BOOK_PAYMENT_FORM_CONFIG.fields.bookingDate.dateConfig,
            response
          );
          queueMicrotask(() => this.changeDetectorRef.detectChanges());
        },
        error: error => {
          this.logger.error('Failed to load project overview', error);
          this.resetBookingDateField();
        },
      });
  }

  private resetBookingDateField(): void {
    resetProjectDateField(
      this.form,
      'bookingDate',
      ADD_BOOK_PAYMENT_FORM_CONFIG.fields.bookingDate.dateConfig
    );
    queueMicrotask(() => this.changeDetectorRef.detectChanges());
  }

  private loadInvoiceOptions(siteId: string): void {
    this.invoiceOptions = [];
    this.selectedInvoiceMeta.set(null);
    this.form?.patch({ invoiceNumber: undefined });
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
    return records.map(record => ({
      label: record.label,
      value: record.id,
      disabled: !record.eligible,
      disabledReason: record.reason ?? undefined,
      data: record.meta,
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
      return;
    }

    this.selectedInvoiceMeta.set(null);
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
