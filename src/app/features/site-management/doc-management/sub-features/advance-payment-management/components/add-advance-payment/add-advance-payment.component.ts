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
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { PoService } from '@features/site-management/doc-management/sub-features/po-management/services/po.service';
import {
  IPoDropdownGetRequestDto,
  IPoDropdownRecordDto,
} from '@features/site-management/doc-management/sub-features/po-management/types/po.dto';
import { BookPaymentInvoiceSummaryComponent } from '@features/site-management/doc-management/sub-features/book-payment-management/components/book-payment-invoice-summary/book-payment-invoice-summary.component';
import { ADD_ADVANCE_PAYMENT_FORM_CONFIG } from '../../config';
import { AdvancePaymentService } from '../../services/advance-payment.service';
import {
  IAddAdvancePaymentFormDto,
  IAddAdvancePaymentResponseDto,
  IAddAdvancePaymentUIFormDto,
} from '../../types/advance-payment.dto';
import { buildAdvancePaymentPoSummaryRows } from '../../utils/advance-payment-table-row.util';

@Component({
  selector: 'app-add-advance-payment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    InputFieldComponent,
    ReactiveFormsModule,
    BookPaymentInvoiceSummaryComponent,
  ],
  templateUrl: './add-advance-payment.component.html',
  styleUrl: './add-advance-payment.component.scss',
})
export class AddAdvancePaymentComponent
  extends FormBase<IAddAdvancePaymentUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly advancePaymentService = inject(AdvancePaymentService);
  private readonly poService = inject(PoService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  private trackedAdvancePaymentInputs!: ITrackedFields<IAddAdvancePaymentUIFormDto>;
  private poOptions: IOptionDropdown<IPoDropdownRecordDto['meta']>[] = [];

  protected readonly selectedPoMeta = signal<
    IPoDropdownRecordDto['meta'] | null
  >(null);

  protected readonly onSuccess = input.required<() => void>();
  protected readonly docContext = input.required<EDocContext>();
  protected readonly projectName = input<string>();

  constructor() {
    super();
    effect(() => {
      if (
        this.trackedAdvancePaymentInputs &&
        this.trackedAdvancePaymentInputs.projectName
      ) {
        const siteId = this.trackedAdvancePaymentInputs.projectName();
        if (siteId && typeof siteId === 'string') {
          this.loadPoOptions(siteId);
          return;
        }

        this.applyPoOptions([], false);
        this.selectedPoMeta.set(null);
      }
    });
    effect(() => {
      this.trackedAdvancePaymentInputs?.poNumber?.();
      this.updateSelectedPoMeta();
    });
  }

  ngOnInit(): void {
    this.form = this.formService.createForm<IAddAdvancePaymentUIFormDto>(
      ADD_ADVANCE_PAYMENT_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: {
          projectName: this.projectName(),
          advanceDate: new Date(),
        },
      }
    );

    this.trackedAdvancePaymentInputs =
      this.formService.trackMultipleFieldChanges<IAddAdvancePaymentUIFormDto>(
        this.form.formGroup,
        ['projectName', 'poNumber'],
        this.destroyRef
      );
  }

  protected poSummaryRows(
    meta: IPoDropdownRecordDto['meta']
  ) {
    return buildAdvancePaymentPoSummaryRows(meta);
  }

  private loadPoOptions(siteId: string): void {
    this.poOptions = [];
    this.selectedPoMeta.set(null);
    this.form?.patch({ poNumber: undefined });
    this.applyPoOptions([], true);

    const paramData = this.prepareParamDataForPoDropdown(siteId);

    this.poService
      .getPoDropdown(paramData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          const opts = this.mapPoRecordToOption(response.records);
          this.poOptions = opts;
          this.applyPoOptions(opts, false);
          this.updateSelectedPoMeta();
        },
        error: error => {
          this.logger.error('Failed to load PO dropdown', error);
          this.notificationService.error(
            'Could not load POs for this project. Please try again.'
          );
          this.applyPoOptions([], false);
        },
      });
  }

  private prepareParamDataForPoDropdown(
    siteId: string
  ): IPoDropdownGetRequestDto {
    return {
      projectName: siteId,
      docType: this.docContext(),
    };
  }

  private mapPoRecordToOption(
    records: IPoDropdownRecordDto[]
  ): IOptionDropdown<IPoDropdownRecordDto['meta']>[] {
    return records.map(record => ({
      label: record.label,
      value: record.id,
      disabled: !record.eligible,
      disabledReason: record.reason ?? undefined,
      data: record.meta,
    }));
  }

  private updateSelectedPoMeta(): void {
    const tracked = this.trackedAdvancePaymentInputs;
    if (!tracked) {
      return;
    }

    const poId = tracked.getValues().poNumber;
    if (typeof poId === 'string' && poId.length > 0) {
      const matched = getMappedValueFromArrayOfObjects(
        this.poOptions,
        poId,
        'value',
        'data'
      ) as IPoDropdownRecordDto['meta'] | undefined;
      this.selectedPoMeta.set(matched ?? null);
      return;
    }

    this.selectedPoMeta.set(null);
  }

  private applyPoOptions(options: IOptionDropdown[], loading: boolean): void {
    if (!this.form) {
      return;
    }

    const base = this.form.fieldConfigs.poNumber;
    this.form.fieldConfigs.poNumber = {
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
    this.executeAddAdvancePaymentAction();
  }

  private executeAddAdvancePaymentAction(): void {
    const formData = this.form.getData();
    const file = formData.advanceAttachment as File[] | undefined;

    this.loadingService.show({
      title: 'Adding advance payment',
      message:
        "Please wait while we're adding the advance payment. This will just take a moment.",
    });
    this.form.disable();

    defer(() =>
      file?.length
        ? this.attachmentsService.uploadFinancialDocument(file[0])
        : of<IFinancialFileUploadResponseDto | null>(null)
    )
      .pipe(
        switchMap(attachmentResponse => {
          const payload = this.prepareFormData(formData, attachmentResponse);
          return this.advancePaymentService.addAdvancePayment(payload);
        }),
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAddAdvancePaymentResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to add advance payment', error);
          this.notificationService.error(
            'Could not add advance payment. Please try again.'
          );
        },
      });
  }

  private prepareFormData(
    formData: IAddAdvancePaymentUIFormDto,
    attachmentResponse: IFinancialFileUploadResponseDto | null
  ): IAddAdvancePaymentFormDto {
    const record = { ...formData };
    delete (record as Record<string, unknown>)['projectName'];
    delete (record as Record<string, unknown>)['advanceAttachment'];
    return {
      ...record,
      fileKey: attachmentResponse?.fileKey ?? null,
      fileName: attachmentResponse?.fileName ?? null,
    };
  }
}
