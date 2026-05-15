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
import { finalize, switchMap } from 'rxjs';

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

import { ADD_INVOICE_FORM_CONFIG } from '../../config';
import { InvoiceService } from '../../services/invoice.service';
import {
  IAddInvoiceFormDto,
  IAddInvoiceResponseDto,
  IAddInvoiceUIFormDto,
} from '../../types/invoice.dto';
import { JmcService } from '@features/site-management/doc-management/sub-features/jmc-management/services/jmc.service';
import {
  IJmcDropdownGetRequestDto,
  IJmcDropdownRecordDto,
} from '@features/site-management/doc-management/sub-features/jmc-management/types/jmc.dto';
import { roundCurrencyAmount } from '@shared/utility';

@Component({
  selector: 'app-add-invoice',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './add-invoice.component.html',
  styleUrl: './add-invoice.component.scss',
})
export class AddInvoiceComponent
  extends FormBase<IAddInvoiceUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly invoiceService = inject(InvoiceService);
  private readonly jmcService = inject(JmcService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  private trackedInvoiceInputs!: ITrackedFields<IAddInvoiceUIFormDto>;

  protected readonly onSuccess = input.required<() => void>();
  protected readonly docContext = input.required<EDocContext>();

  constructor() {
    super();
    effect(() => {
      if (this.trackedInvoiceInputs && this.trackedInvoiceInputs.projectName) {
        const siteId = this.trackedInvoiceInputs.projectName();
        if (siteId && typeof siteId === 'string') {
          this.loadJmcOptions(siteId);
        }
      }
    });
    effect(() => {
      const tracked = this.trackedInvoiceInputs;
      tracked.taxableAmount?.();
      tracked.gstPercent?.();
      this.recalcGstAndTotal();
    });
  }

  ngOnInit(): void {
    this.form = this.formService.createForm<IAddInvoiceUIFormDto>(
      ADD_INVOICE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    this.trackedInvoiceInputs =
      this.formService.trackMultipleFieldChanges<IAddInvoiceUIFormDto>(
        this.form.formGroup,
        ['taxableAmount', 'gstPercent', 'projectName'],
        this.destroyRef
      );
  }

  private loadJmcOptions(siteId: string): void {
    this.applyJmcOptions([], true);

    const paramData = this.prepareParamDataForJmcDropdown(siteId);

    this.jmcService
      .getJmcDropdown(paramData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          const jmcOptionDropdown = this.mapJmcRecordToOption(response.records);
          this.applyJmcOptions(jmcOptionDropdown, false);
        },
        error: error => {
          this.logger.error('Failed to load JMC dropdown', error);
          this.notificationService.error(
            'Could not load the JMC list for this project. Please try again.'
          );
          this.applyJmcOptions([], false);
        },
      });
  }

  private prepareParamDataForJmcDropdown(
    siteId: string
  ): IJmcDropdownGetRequestDto {
    return {
      projectName: siteId,
      docType: this.docContext(),
    };
  }

  private mapJmcRecordToOption(
    records: IJmcDropdownRecordDto[]
  ): IOptionDropdown[] {
    return records.map(record => ({
      label: record.label,
      value: record.id,
      disabled: !record.eligible,
      disabledReason: record.reason ?? undefined,
    }));
  }

  private applyJmcOptions(options: IOptionDropdown[], loading: boolean): void {
    const base = this.form.fieldConfigs.jmcNumber;
    this.form.fieldConfigs.jmcNumber = {
      ...base,
      selectConfig: {
        ...base.selectConfig,
        optionsDropdown: options,
        loading,
      },
    } as IInputFieldsConfig;

    queueMicrotask(() => this.changeDetectorRef.detectChanges());
  }

  private recalcGstAndTotal(): void {
    const tracked = this.trackedInvoiceInputs;
    if (!tracked) {
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
    this.executeAddInvoiceAction();
  }

  private executeAddInvoiceAction(): void {
    const file = this.form.getFieldData('invoiceAttachment');

    this.loadingService.show({
      title: 'Adding Invoice',
      message:
        "Please wait while we're adding the invoice. This will just take a moment.",
    });
    this.form.disable();

    this.attachmentsService
      .uploadFinancialDocument(file[0])
      .pipe(
        switchMap(attachmentResponse => {
          const formData = this.prepareFormData(attachmentResponse);
          return this.invoiceService.addInvoice(formData);
        }),
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAddInvoiceResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to add invoice', error);
          this.notificationService.error(
            'Could not add the invoice. Please try again.'
          );
        },
      });
  }

  private prepareFormData(
    attachmentResponse: IFinancialFileUploadResponseDto
  ): IAddInvoiceFormDto {
    const formData = this.form.getData();
    const record = { ...formData };
    delete (record as Record<string, unknown>)['invoiceAttachment'];
    delete (record as Record<string, unknown>)['projectName'];
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
