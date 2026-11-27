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
import { defer, finalize, mergeMap, of } from 'rxjs';

import { FormBase } from '@shared/base/form.base';
import {
  IDialogActionHandler,
  IFinancialFileUploadResponseDto,
  IInputFieldsConfig,
  IOptionDropdown,
  ITrackedFields,
} from '@shared/types';
import {
  AttachmentsService,
  ConfirmationDialogService,
} from '@shared/services';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { InvoiceService } from '@features/site-management/doc-management/sub-features/invoice-management/services/invoice.service';
import {
  IInvoiceDropdownGetRequestDto,
  IInvoiceDropdownRecordDto,
} from '@features/site-management/doc-management/sub-features/invoice-management/types/invoice.dto';
import { BookPaymentService } from '@features/site-management/doc-management/sub-features/book-payment-management/services/book-payment.service';
import { IBookPaymentDropdownRecordDto } from '@features/site-management/doc-management/sub-features/book-payment-management/types/book-payment.dto';

import { ADD_BANK_TRANSFER_FORM_CONFIG } from '../../config';
import { BOOK_PAYMENT_BY_INVOICE_DEPENDENCY } from '../../config/form/add-bank-transfer.config';
import { IBookPaymentOptionData } from '../../types/bank-transfer.interface';
import { EPaymentTypeFilter } from '@features/site-management/doc-management/shared/config/payment-filter.config';
import { BankTransferService } from '../../services/bank-transfer.service';
import {
  IAddBankTransferFormDto,
  IAddBankTransferResponseDto,
  IAddBankTransferUIFormDto,
} from '../../types/bank-transfer.dto';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { ProjectService } from '@features/site-management/project-management/services/project.service';
import { IProjectOverviewGetResponseDto } from '@features/site-management/project-management/types/project.dto';
import {
  applyProjectDateRangeFromOverview,
  resetProjectDateField,
  setProjectDateFieldLoading,
} from '@features/site-management/project-management/utility/project-overview-date.util';

@Component({
  selector: 'app-add-bank-transfer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './add-bank-transfer.component.html',
  styleUrl: './add-bank-transfer.component.scss',
})
export class AddBankTransferComponent
  extends FormBase<IAddBankTransferUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly bankTransferService = inject(BankTransferService);
  private readonly invoiceService = inject(InvoiceService);
  private readonly bookPaymentService = inject(BookPaymentService);
  private readonly projectService = inject(ProjectService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  private trackedBankTransferInputs!: ITrackedFields<IAddBankTransferUIFormDto>;

  protected readonly EDocContext = EDocContext;

  protected readonly onSuccess = input.required<() => void>();
  protected readonly docContext = input.required<EDocContext>();
  protected readonly projectName = input<string>();

  protected transferAmount: number | null = null;
  private bookPaymentOptions: IOptionDropdown<IBookPaymentOptionData>[] = [];

  constructor() {
    super();
    effect(() => {
      if (
        this.trackedBankTransferInputs &&
        this.trackedBankTransferInputs.projectName
      ) {
        const siteId = this.trackedBankTransferInputs.projectName();
        if (siteId && typeof siteId === 'string') {
          this.loadProjectDateRange(siteId);
          this.loadInvoiceOptions(siteId);
          return;
        }

        this.resetTransferDateField();
      }
    });
    effect(() => {
      if (
        this.trackedBankTransferInputs &&
        this.trackedBankTransferInputs.invoiceNumber
      ) {
        if (this.docContext() !== EDocContext.PURCHASE) {
          return;
        }
        const raw = this.trackedBankTransferInputs.invoiceNumber();
        // Advance / GST release list by project (effect below); the invoice is cleared for them.
        if (this.selectedPaymentType() !== EPaymentTypeFilter.INVOICE) {
          return;
        }
        this.loadBookPaymentOptions(
          typeof raw === 'string' && raw.length > 0 ? raw : null
        );
      }
    });

    // Advance / GST release: no invoice step — list the project's bookings of that type.
    effect(() => {
      if (
        !this.trackedBankTransferInputs?.paymentType ||
        this.docContext() !== EDocContext.PURCHASE
      ) {
        return;
      }
      const paymentType = this.selectedPaymentType();
      const siteId = this.trackedBankTransferInputs.projectName?.();
      this.applyBookPaymentDependency(paymentType);
      if (paymentType === EPaymentTypeFilter.INVOICE) {
        return;
      }
      this.form.formGroup.get('bookPaymentNumber')?.setValue(null);
      this.loadBookPaymentOptionsByType(
        typeof siteId === 'string' && siteId.length > 0 ? siteId : null,
        paymentType
      );
    });

    effect(() => {
      if (
        this.trackedBankTransferInputs &&
        this.trackedBankTransferInputs.bookPaymentNumber
      ) {
        const selectedId = this.trackedBankTransferInputs.bookPaymentNumber();
        if (typeof selectedId === 'string' && selectedId.length > 0) {
          const matched = getMappedValueFromArrayOfObjects(
            this.bookPaymentOptions,
            selectedId,
            'value',
            'data'
          ) as IBookPaymentOptionData | undefined;
          // The transfer must equal total − hold; the backend rejects anything else.
          this.transferAmount =
            matched?.expectedTransferAmount ??
            matched?.paymentTotalAmount ??
            null;
        } else {
          this.transferAmount = null;
        }
      }
    });
  }

  ngOnInit(): void {
    this.form = this.formService.createForm<IAddBankTransferUIFormDto>(
      ADD_BANK_TRANSFER_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: {
          projectName: this.projectName(),
          paymentType:
            this.docContext() === EDocContext.PURCHASE
              ? EPaymentTypeFilter.INVOICE
              : null,
          invoiceNumber: null,
          bookPaymentNumber: null,
          remarks: null,
        },
        context: { docContext: this.docContext() },
      }
    );

    if (this.docContext() === EDocContext.SALES) {
      this.form.fieldConfigs.transferDate = {
        ...this.form.fieldConfigs.transferDate,
        label: 'Received Date',
      };
      this.form.fieldConfigs.transferAmount = {
        ...this.form.fieldConfigs.transferAmount,
        label: 'Received Amount',
      };
      this.form.fieldConfigs.paidFromAccount = {
        ...this.form.fieldConfigs.paidFromAccount,
        label: 'Bank Received Account',
      };
      this.form.fieldConfigs.proofAttachment = {
        ...this.form.fieldConfigs.proofAttachment,
        label: 'Proof of receipt',
      };
    } else {
      this.form.fieldConfigs.paidFromAccount = {
        ...this.form.fieldConfigs.paidFromAccount,
        label: 'Bank Transfer Account',
      };
    }

    const trackedFields: (keyof IAddBankTransferUIFormDto)[] =
      this.docContext() === EDocContext.SALES
        ? ['projectName', 'invoiceNumber', 'transferAmount']
        : ['projectName', 'paymentType', 'invoiceNumber', 'bookPaymentNumber'];

    this.trackedBankTransferInputs =
      this.formService.trackMultipleFieldChanges<IAddBankTransferUIFormDto>(
        this.form.formGroup,
        trackedFields,
        this.destroyRef
      );
  }

  private loadProjectDateRange(projectId: string): void {
    setProjectDateFieldLoading(this.form, 'transferDate', true);
    queueMicrotask(() => this.changeDetectorRef.detectChanges());

    this.projectService
      .getProjectOverview(projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: IProjectOverviewGetResponseDto) => {
          applyProjectDateRangeFromOverview(
            this.form,
            'transferDate',
            ADD_BANK_TRANSFER_FORM_CONFIG.fields.transferDate.dateConfig,
            response
          );
          queueMicrotask(() => this.changeDetectorRef.detectChanges());
        },
        error: error => {
          this.logger.error('Failed to load project overview', error);
          this.resetTransferDateField();
        },
      });
  }

  private resetTransferDateField(): void {
    resetProjectDateField(
      this.form,
      'transferDate',
      ADD_BANK_TRANSFER_FORM_CONFIG.fields.transferDate.dateConfig
    );
    queueMicrotask(() => this.changeDetectorRef.detectChanges());
  }

  private loadInvoiceOptions(siteId: string): void {
    this.applySelectOptions('invoiceNumber', [], true);

    const paramData = this.prepareParamDataForInvoiceDropdown(siteId);

    this.invoiceService
      .getInvoiceDropdown(paramData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          const opts = this.mapInvoiceRecordToOption(response.records);
          this.applySelectOptions('invoiceNumber', opts, false);
        },
        error: error => {
          this.logger.error('Failed to load invoice dropdown', error);
          this.notificationService.error(
            'Could not load invoices for this project. Please try again.'
          );
          this.applySelectOptions('invoiceNumber', [], false);
        },
      });
  }

  private loadBookPaymentOptions(invoiceId: string | null | undefined): void {
    this.bookPaymentOptions = [];
    this.transferAmount = null;
    if (!invoiceId || typeof invoiceId !== 'string') {
      this.applySelectOptions('bookPaymentNumber', [], false);
      return;
    }
    this.applySelectOptions('bookPaymentNumber', [], true);

    this.bookPaymentService
      .getBookPaymentDropdown({
        invoiceNumber: invoiceId,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          const opts = this.mapBookPaymentRecordToOption(response.records);
          this.bookPaymentOptions = opts;
          this.applySelectOptions('bookPaymentNumber', opts, false);
        },
        error: error => {
          this.logger.error('Failed to load book payment dropdown', error);
          this.notificationService.error(
            'Could not load book payments for this invoice. Please try again.'
          );
          this.applySelectOptions('bookPaymentNumber', [], false);
        },
      });
  }

  /** Advance / GST release bookings of a project (they have no invoice step to filter by). */
  private loadBookPaymentOptionsByType(
    siteId: string | null,
    paymentType: EPaymentTypeFilter.ADVANCE | EPaymentTypeFilter.GST
  ): void {
    this.bookPaymentOptions = [];
    this.transferAmount = null;
    if (!siteId) {
      this.applySelectOptions('bookPaymentNumber', [], false);
      return;
    }
    this.applySelectOptions('bookPaymentNumber', [], true);

    this.bookPaymentService
      .getBookPaymentDropdown({ projectName: siteId, paymentType })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          // Ignore a late reply after the user switched type or project.
          if (
            this.selectedPaymentType() !== paymentType ||
            this.form.getFieldData('projectName') !== siteId
          ) {
            return;
          }
          const opts = this.mapBookPaymentRecordToOption(response.records);
          this.bookPaymentOptions = opts;
          this.applySelectOptions('bookPaymentNumber', opts, false);
        },
        error: error => {
          this.logger.error('Failed to load book payment dropdown', error);
          this.notificationService.error(
            'Could not load book payments for this project. Please try again.'
          );
          this.applySelectOptions('bookPaymentNumber', [], false);
        },
      });
  }

  /** Book Payment waits for the invoice only on an invoice payment. */
  private applyBookPaymentDependency(paymentType: EPaymentTypeFilter): void {
    const base = this.form.fieldConfigs.bookPaymentNumber;
    const dependentDropdown =
      paymentType === EPaymentTypeFilter.INVOICE
        ? BOOK_PAYMENT_BY_INVOICE_DEPENDENCY
        : undefined;
    if (base.selectConfig?.dependentDropdown === dependentDropdown) {
      return;
    }
    this.form.fieldConfigs.bookPaymentNumber = {
      ...base,
      selectConfig: { ...base.selectConfig, dependentDropdown },
    } as IInputFieldsConfig;
    queueMicrotask(() => this.changeDetectorRef.detectChanges());
  }

  private selectedPaymentType(): EPaymentTypeFilter {
    const value = this.trackedBankTransferInputs?.paymentType?.();
    return (value as EPaymentTypeFilter | null) ?? EPaymentTypeFilter.INVOICE;
  }

  /** Sales always picks an invoice; a vendor transfer only for an invoice payment. */
  protected showInvoiceField(): boolean {
    return (
      this.docContext() === EDocContext.SALES ||
      this.selectedPaymentType() === EPaymentTypeFilter.INVOICE
    );
  }

  private prepareParamDataForInvoiceDropdown(
    siteId: string
  ): IInvoiceDropdownGetRequestDto {
    return {
      projectName: siteId,
      docType: this.docContext(),
      forDocument: 'bank-transfer',
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

  private mapBookPaymentRecordToOption(
    records: IBookPaymentDropdownRecordDto[]
  ): IOptionDropdown<IBookPaymentOptionData>[] {
    return records.map(record => ({
      label: record.label,
      value: record.id,
      disabled: !record.eligible,
      disabledReason: record.reason ?? undefined,
      data: {
        paymentTotalAmount: record.meta.paymentTotalAmount,
        expectedTransferAmount: record.meta.expectedTransferAmount,
      },
    }));
  }

  private applySelectOptions(
    field: 'invoiceNumber' | 'bookPaymentNumber',
    options: IOptionDropdown[],
    loading: boolean
  ): void {
    const base = this.form.fieldConfigs[field];
    this.form.fieldConfigs[field] = {
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
    this.executeAddBankTransferAction();
  }

  private executeAddBankTransferAction(): void {
    const isSales = this.docContext() === EDocContext.SALES;
    const file = this.form.getFieldData('proofAttachment') as
      | File[]
      | undefined;

    this.loadingService.show({
      title: isSales ? 'Adding bank received' : 'Adding bank transfer',
      message: isSales
        ? "Please wait while we're recording the bank receipt. This will just take a moment."
        : "Please wait while we're recording the bank transfer. This will just take a moment.",
    });
    // Read before disabling. Disabling runs the conditional validators (invoice depends on payment
    // type), which leave the group's own status enabled while every control is disabled — after
    // that `getData()` (enabled controls only) comes back empty.
    const formData = this.form.getData();
    this.form.disable();

    defer(() =>
      file?.length
        ? this.attachmentsService.uploadFinancialDocument(file[0])
        : of<IFinancialFileUploadResponseDto | null>(null)
    )
      .pipe(
        mergeMap((attachmentResponse: IFinancialFileUploadResponseDto | null) =>
          this.bankTransferService.addBankTransfer(
            this.prepareFormData(formData, attachmentResponse ?? undefined)
          )
        ),
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAddBankTransferResponseDto) => {
          this.notifyAddResult(response, isSales);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: (error: unknown) => {
          this.logger.error('Failed to add bank transfer', error);
          this.notificationService.error(
            isSales
              ? 'Could not add bank received. Please try again.'
              : 'Could not add bank transfer. Please try again.'
          );
        },
      });
  }

  /**
   * A vendor transfer always goes through; if its payment sheet could not be written that is a
   * warning, not a failure (retrying would pay twice).
   */
  private notifyAddResult(
    response: IAddBankTransferResponseDto,
    isSales: boolean
  ): void {
    const sheetNumber = response.paymentSheet?.sheetNumber;
    if (sheetNumber) {
      this.notificationService.success(
        `Bank transfer recorded. Payment sheet ${sheetNumber} created.`
      );
      return;
    }
    if (isSales) {
      this.notificationService.success(response.message);
      return;
    }
    this.notificationService.warning(response.message);
  }

  private prepareFormData(
    formData: IAddBankTransferUIFormDto,
    attachmentResponse?: IFinancialFileUploadResponseDto | null
  ): IAddBankTransferFormDto {
    const record = { ...formData };
    delete (record as Record<string, unknown>)['projectName'];
    delete (record as Record<string, unknown>)['proofAttachment'];
    delete (record as Record<string, unknown>)['paymentType'];
    return {
      ...record,
      partyType: this.docContext(),
      transferProofFileKey: attachmentResponse?.fileKey ?? null,
      transferProofFileName: attachmentResponse?.fileName ?? null,
      transferAmount:
        EDocContext.PURCHASE === this.docContext()
          ? this.transferAmount
          : record.transferAmount,
    };
  }
}
