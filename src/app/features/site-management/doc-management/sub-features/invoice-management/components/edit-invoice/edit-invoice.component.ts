import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, switchMap } from 'rxjs';

import { FormBase } from '@shared/base/form.base';
import {
  IDialogActionHandler,
  IFinancialFileUploadResponseDto,
  IInputFieldsConfig,
  ITrackedFields,
} from '@shared/types';
import {
  AttachmentsService,
  ConfirmationDialogService,
} from '@shared/services';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { roundCurrencyAmount } from '@shared/utility';

import { EDIT_INVOICE_FORM_CONFIG } from '../../config';
import { InvoiceService } from '../../services/invoice.service';
import {
  IEditInvoiceFormDto,
  IEditInvoiceResponseDto,
  IEditInvoiceUIFormDto,
  IInvoiceGetBaseResponseDto,
} from '../../types/invoice.dto';

@Component({
  selector: 'app-edit-invoice',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './edit-invoice.component.html',
  styleUrl: './edit-invoice.component.scss',
})
export class EditInvoiceComponent
  extends FormBase<IEditInvoiceUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly invoiceService = inject(InvoiceService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  private trackedGstInputs!: ITrackedFields<IEditInvoiceUIFormDto>;

  private allowAmountAutoRecalc = false;

  private prefilledTaxableAmount: number | null = null;
  private prefilledGstPercent: number | null = null;

  protected readonly selectedRecord =
    input.required<IInvoiceGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  constructor() {
    super();
    effect(() => {
      const tracked = this.trackedGstInputs;
      const taxable = tracked?.taxableAmount?.();
      const gstPercent = tracked?.gstPercent?.();
      const { prefilledTaxableAmount } = this;
      const { prefilledGstPercent } = this;
      if (
        prefilledTaxableAmount !== null &&
        prefilledGstPercent !== null &&
        tracked !== undefined
      ) {
        if (
          taxable !== prefilledTaxableAmount ||
          gstPercent !== prefilledGstPercent
        ) {
          this.allowAmountAutoRecalc = true;
        }
      }
      this.recalcGstAndTotal();
    });
  }

  ngOnInit(): void {
    const rows = this.selectedRecord();
    const record = rows?.[0];
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error('Edit Invoice: selected record was not provided');
      return;
    }

    this.form = this.formService.createForm<IEditInvoiceUIFormDto>(
      EDIT_INVOICE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: {
          projectName: record.siteId,
          jmcNumber: record.jmcId,
          invoiceNumber: record.invoiceNumber,
          invoiceDate: new Date(record.invoiceDate),
          taxableAmount: Number(record.taxableAmount),
          gstPercent: Number(record.gstPercentage),
          gstAmount: Number(record.gstAmount),
          totalAmount: Number(record.totalAmount),
          invoiceAttachment: [],
          remarks: record.remarks ?? null,
        },
      }
    );

    this.seedJmcOption(record.jmc.jmcNumber, record.jmcId);

    this.trackedGstInputs =
      this.formService.trackMultipleFieldChanges<IEditInvoiceUIFormDto>(
        this.form.formGroup,
        ['taxableAmount', 'gstPercent'],
        this.destroyRef
      );

    const { taxableAmount, gstPercent } = this.trackedGstInputs.getValues();
    this.prefilledTaxableAmount =
      taxableAmount === null || taxableAmount === undefined
        ? null
        : Number(taxableAmount);
    this.prefilledGstPercent =
      gstPercent === null || gstPercent === undefined
        ? null
        : Number(gstPercent);

    this.loadPrefillAttachmentFromKey(record.fileKey);
  }

  private seedJmcOption(jmcNumber: string, jmcId: string): void {
    const base = this.form.fieldConfigs.jmcNumber;
    this.form.fieldConfigs.jmcNumber = {
      ...base,
      selectConfig: {
        ...base.selectConfig,
        optionsDropdown: [
          {
            label: jmcNumber,
            value: jmcId,
          },
        ],
      },
    } as IInputFieldsConfig;
  }

  private loadPrefillAttachmentFromKey(fileKey: string): void {
    this.loadingService.show({
      title: 'Loading Invoice data',
      message: 'Fetching the invoice data. Please wait…',
    });
    this.attachmentsService
      .loadFilesFromKeys([fileKey])
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: files => {
          this.form.patch({ invoiceAttachment: files });
        },
        error: error => {
          this.logger.error('Failed to prefetch invoice attachment', error);
          this.notificationService.error(
            'Could not load the attachment. You can upload a new file.'
          );
        },
      });
  }

  private recalcGstAndTotal(): void {
    const tracked = this.trackedGstInputs;
    if (!tracked || !this.allowAmountAutoRecalc) {
      return;
    }
    const { taxableAmount, gstPercent } = tracked.getValues();
    const taxable =
      taxableAmount === null || taxableAmount === undefined
        ? NaN
        : Number(taxableAmount);
    const gstPercentValue =
      gstPercent === null || gstPercent === undefined
        ? NaN
        : Number(gstPercent);

    if (isNaN(taxable) || isNaN(gstPercentValue)) {
      return;
    }

    const gst = roundCurrencyAmount(taxable * (gstPercentValue / 100));
    const total = roundCurrencyAmount(taxable + gst);
    this.form.formGroup.patchValue({
      gstAmount: gst,
      totalAmount: total,
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
    this.executeEditInvoiceAction(record.id);
  }

  private executeEditInvoiceAction(invoiceId: string): void {
    const file = this.form.getFieldData('invoiceAttachment');

    this.loadingService.show({
      title: 'Updating Invoice',
      message:
        'Please wait while we update the invoice. This will just take a moment.',
    });
    this.form.disable();

    this.attachmentsService
      .uploadFinancialDocument(file[0])
      .pipe(
        switchMap(attachmentResponse => {
          const formData = this.prepareFormData(attachmentResponse);
          return this.invoiceService.editInvoice(formData, invoiceId);
        }),
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IEditInvoiceResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to edit invoice', error);
          this.notificationService.error(
            'Could not update the invoice. Please try again.'
          );
        },
      });
  }

  private prepareFormData(
    attachmentResponse: IFinancialFileUploadResponseDto
  ): IEditInvoiceFormDto {
    const formData = this.form.getData();
    const record = { ...formData };
    delete (record as Record<string, unknown>)['invoiceAttachment'];
    delete (record as Record<string, unknown>)['projectName'];
    delete (record as Record<string, unknown>)['jmcNumber'];
    return {
      ...record,
      taxableAmount: roundCurrencyAmount(Number(record.taxableAmount)),
      gstAmount: roundCurrencyAmount(Number(record.gstAmount)),
      totalAmount: roundCurrencyAmount(Number(record.totalAmount)),
      invoiceFileKey: attachmentResponse.fileKey,
      invoiceFileName: attachmentResponse.fileName,
    };
  }
}
