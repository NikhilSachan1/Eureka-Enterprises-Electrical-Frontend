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
  private bookPaymentOptions: IOptionDropdown<{
    paymentTotalAmount: number;
  }>[] = [];

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
        this.loadBookPaymentOptions(
          typeof raw === 'string' && raw.length > 0 ? raw : null
        );
      }
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
          ) as { paymentTotalAmount: number } | undefined;
          this.transferAmount = matched?.paymentTotalAmount ?? null;
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
        : ['projectName', 'invoiceNumber', 'bookPaymentNumber'];

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
  ): IOptionDropdown<{ paymentTotalAmount: number }>[] {
    return records.map(record => ({
      label: record.label,
      value: record.id,
      disabled: !record.eligible,
      disabledReason: record.reason ?? undefined,
      data: { paymentTotalAmount: record.meta.paymentTotalAmount },
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
    this.form.disable();

    defer(() =>
      file?.length
        ? this.attachmentsService.uploadFinancialDocument(file[0])
        : of<IFinancialFileUploadResponseDto | null>(null)
    )
      .pipe(
        mergeMap((attachmentResponse: IFinancialFileUploadResponseDto | null) =>
          this.bankTransferService.addBankTransfer(
            this.prepareFormData(attachmentResponse ?? undefined)
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
          this.notificationService.success(response.message);
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

  private prepareFormData(
    attachmentResponse?: IFinancialFileUploadResponseDto | null
  ): IAddBankTransferFormDto {
    const formData = this.form.getData();
    const record = { ...formData };
    delete (record as Record<string, unknown>)['projectName'];
    delete (record as Record<string, unknown>)['proofAttachment'];
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
