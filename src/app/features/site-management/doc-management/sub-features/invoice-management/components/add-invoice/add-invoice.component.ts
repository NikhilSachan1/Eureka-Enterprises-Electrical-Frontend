import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  Signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { defer, finalize, of, switchMap } from 'rxjs';

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
import { ProjectService } from '@features/site-management/project-management/services/project.service';
import { IProjectOverviewGetResponseDto } from '@features/site-management/project-management/types/project.dto';
import {
  applyProjectDateRangeFromOverview,
  resetProjectDateField,
  setProjectDateFieldLoading,
} from '@features/site-management/project-management/utility/project-overview-date.util';

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
  private readonly projectService = inject(ProjectService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  private trackedInvoiceInputs!: ITrackedFields<IAddInvoiceUIFormDto>;
  private isNoInvoiceTracked!: Signal<boolean | null | undefined>;

  /** Hidden when no invoice is selected; shown when unset (default) or invoice exists. */
  protected readonly showInvoiceDetails = computed(
    () => !this.isNoInvoiceTracked()
  );

  protected readonly onSuccess = input.required<() => void>();
  protected readonly docContext = input.required<EDocContext>();
  protected readonly projectName = input<string>();

  constructor() {
    super();
    effect(() => {
      if (this.trackedInvoiceInputs && this.trackedInvoiceInputs.projectName) {
        const siteId = this.trackedInvoiceInputs.projectName();
        if (siteId && typeof siteId === 'string') {
          this.loadProjectDateRange(siteId);
          this.loadJmcOptions(siteId);
          return;
        }

        this.resetInvoiceDateField();
      }
    });
    effect(() => {
      const tracked = this.trackedInvoiceInputs;
      if (!tracked || this.isNoInvoiceTracked?.()) {
        return;
      }
      tracked.taxableAmount?.();
      tracked.tdsPercent?.();
      tracked.gstPercent?.();
      this.recalcTdsAndAmounts();
    });
  }

  ngOnInit(): void {
    this.form = this.formService.createForm<IAddInvoiceUIFormDto>(
      ADD_INVOICE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: {
          projectName: this.projectName(),
        },
      }
    );

    this.trackedInvoiceInputs =
      this.formService.trackMultipleFieldChanges<IAddInvoiceUIFormDto>(
        this.form.formGroup,
        ['taxableAmount', 'tdsPercent', 'gstPercent', 'projectName'],
        this.destroyRef
      );

    this.isNoInvoiceTracked = this.formService.trackFieldChanges(
      this.form.formGroup,
      'isNoInvoice',
      this.destroyRef
    );
  }

  private loadProjectDateRange(projectId: string): void {
    setProjectDateFieldLoading(this.form, 'invoiceDate', true);
    queueMicrotask(() => this.changeDetectorRef.detectChanges());

    this.projectService
      .getProjectOverview(projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: IProjectOverviewGetResponseDto) => {
          applyProjectDateRangeFromOverview(
            this.form,
            'invoiceDate',
            ADD_INVOICE_FORM_CONFIG.fields.invoiceDate.dateConfig,
            response
          );
          queueMicrotask(() => this.changeDetectorRef.detectChanges());
        },
        error: error => {
          this.logger.error('Failed to load project overview', error);
          this.resetInvoiceDateField();
        },
      });
  }

  private resetInvoiceDateField(): void {
    resetProjectDateField(
      this.form,
      'invoiceDate',
      ADD_INVOICE_FORM_CONFIG.fields.invoiceDate.dateConfig
    );
    queueMicrotask(() => this.changeDetectorRef.detectChanges());
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
      forDocument: 'invoice',
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

  private recalcTdsAndAmounts(): void {
    const tracked = this.trackedInvoiceInputs;
    if (!tracked) {
      return;
    }
    const { taxableAmount, tdsPercent, gstPercent } = tracked.getValues();

    if (this.isEmptyNumberInput(taxableAmount)) {
      this.form.formGroup.patchValue({
        tdsAmount: null,
        gstAmount: null,
        totalAmount: null,
      });
      return;
    }

    const taxable = Number(taxableAmount);
    const tdsPercentValue =
      tdsPercent === null || tdsPercent === undefined
        ? NaN
        : Number(tdsPercent);
    const gstPercentValue =
      gstPercent === null || gstPercent === undefined
        ? NaN
        : Number(gstPercent);

    if (isNaN(taxable) || isNaN(tdsPercentValue) || isNaN(gstPercentValue)) {
      this.form.formGroup.patchValue({
        tdsAmount: null,
        gstAmount: null,
        totalAmount: null,
      });
      return;
    }

    const tds = roundCurrencyAmount(taxable * (tdsPercentValue / 100));
    const gst = roundCurrencyAmount(taxable * (gstPercentValue / 100));
    const total = roundCurrencyAmount(taxable + gst);
    this.form.formGroup.patchValue({
      tdsAmount: tds,
      gstAmount: gst,
      totalAmount: total,
    });
  }

  private isEmptyNumberInput(value: unknown): boolean {
    return value === null || value === undefined || value === '';
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    this.executeAddInvoiceAction();
  }

  private executeAddInvoiceAction(): void {
    const formData = this.form.getData();
    const isNoInvoice = Boolean(formData.isNoInvoice);
    const file = formData.invoiceAttachment as File[] | undefined;

    this.loadingService.show({
      title: 'Adding Invoice',
      message:
        "Please wait while we're adding the invoice. This will just take a moment.",
    });
    this.form.disable();

    defer(() =>
      !isNoInvoice && file?.length
        ? this.attachmentsService.uploadFinancialDocument(file[0])
        : of<IFinancialFileUploadResponseDto | null>(null)
    )
      .pipe(
        switchMap(attachmentResponse => {
          const payload = this.prepareFormData(formData, attachmentResponse);
          return this.invoiceService.addInvoice(payload);
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
    formData: IAddInvoiceUIFormDto,
    attachmentResponse: IFinancialFileUploadResponseDto | null
  ): IAddInvoiceFormDto {
    const record = { ...formData };
    delete (record as Record<string, unknown>)['invoiceAttachment'];
    delete (record as Record<string, unknown>)['projectName'];
    return {
      ...record,
      invoiceFileKey: attachmentResponse?.fileKey ?? null,
      invoiceFileName: attachmentResponse?.fileName ?? null,
    };
  }
}
