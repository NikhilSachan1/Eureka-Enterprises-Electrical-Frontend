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
          paymentHoldReason: record.paymentHoldReason ?? null,
          remarks: record.remarks ?? null,
        },
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
        ['projectName'],
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
      forDocument: 'book-payment',
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
