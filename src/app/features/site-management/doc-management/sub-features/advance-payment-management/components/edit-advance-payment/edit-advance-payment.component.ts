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
import {
  AttachmentsService,
  ConfirmationDialogService,
} from '@shared/services';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { PoService } from '@features/site-management/doc-management/sub-features/po-management/services/po.service';
import {
  IPoDropdownGetRequestDto,
  IPoDropdownRecordDto,
} from '@features/site-management/doc-management/sub-features/po-management/types/po.dto';
import { EDIT_ADVANCE_PAYMENT_FORM_CONFIG } from '../../config';
import { AdvancePaymentService } from '../../services/advance-payment.service';
import {
  IEditAdvancePaymentFormDto,
  IEditAdvancePaymentResponseDto,
  IEditAdvancePaymentUIFormDto,
  IAdvancePaymentGetBaseResponseDto,
} from '../../types/advance-payment.dto';
import {
  buildAdvancePaymentPoSummaryRows,
  parseAdvancePaymentAmount,
  resolveAdvancePaymentPoId,
  resolveAdvancePaymentPoNumber,
  resolveAdvancePaymentSiteId,
} from '../../utils/advance-payment-table-row.util';
import { parseProjectDateOnly } from '@features/site-management/project-management/utility/project-overview-date.util';
import { BookPaymentInvoiceSummaryComponent } from '@features/site-management/doc-management/sub-features/book-payment-management/components/book-payment-invoice-summary/book-payment-invoice-summary.component';

@Component({
  selector: 'app-edit-advance-payment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    InputFieldComponent,
    ReactiveFormsModule,
    BookPaymentInvoiceSummaryComponent,
  ],
  templateUrl: './edit-advance-payment.component.html',
  styleUrl: './edit-advance-payment.component.scss',
})
export class EditAdvancePaymentComponent
  extends FormBase<IEditAdvancePaymentUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly advancePaymentService = inject(AdvancePaymentService);
  private readonly poService = inject(PoService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  private trackedAdvancePaymentInputs?: ITrackedFields<IEditAdvancePaymentUIFormDto>;
  private poOptions: IOptionDropdown<IPoDropdownRecordDto['meta']>[] = [];

  protected readonly selectedPoMeta = signal<
    IPoDropdownRecordDto['meta'] | null
  >(null);

  protected readonly selectedRecord =
    input.required<IAdvancePaymentGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();
  protected readonly docContext = input.required<EDocContext>();

  constructor() {
    super();
    effect(() => {
      this.trackedAdvancePaymentInputs?.poNumber?.();
      this.updateSelectedPoMeta();
    });
  }

  ngOnInit(): void {
    const record = this.selectedRecord()?.[0];
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to edit advance payment but was not provided'
      );
      this.confirmationDialogService.closeDialog();
      return;
    }

    const amount = parseAdvancePaymentAmount(record.amount);

    this.form = this.formService.createForm<IEditAdvancePaymentUIFormDto>(
      EDIT_ADVANCE_PAYMENT_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: {
          projectName: resolveAdvancePaymentSiteId(record),
          poNumber: resolveAdvancePaymentPoId(record),
          vendorAdvanceNumber: record.vendorAdvanceNumber ?? '',
          amount: amount ?? undefined,
          advanceDate: parseProjectDateOnly(record.advanceDate) ?? new Date(),
        },
      }
    );

    this.seedPoNumberOption(record);
    this.selectedPoMeta.set(this.mapRecordPoMeta(record));

    this.trackedAdvancePaymentInputs =
      this.formService.trackMultipleFieldChanges<IEditAdvancePaymentUIFormDto>(
        this.form.formGroup,
        ['poNumber'],
        this.destroyRef
      );

    const siteId = resolveAdvancePaymentSiteId(record);
    if (siteId) {
      this.loadPoOptions(siteId);
    }

    if (record.fileKey) {
      this.loadPrefillAttachmentFromKey(record.fileKey);
    }
  }

  protected poSummaryRows(meta: IPoDropdownRecordDto['meta']) {
    return buildAdvancePaymentPoSummaryRows(meta);
  }

  private loadPrefillAttachmentFromKey(fileKey: string): void {
    this.loadingService.show({
      title: 'Loading advance payment data',
      message: 'Fetching the attachment. Please wait…',
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
          this.form.patch({ advanceAttachment: files });
        },
        error: error => {
          this.logger.error(
            'Failed to prefetch advance payment attachment',
            error
          );
          this.notificationService.error(
            'Could not load the attachment. You can upload a new file.'
          );
        },
      });
  }

  private seedPoNumberOption(record: IAdvancePaymentGetBaseResponseDto): void {
    const poId = resolveAdvancePaymentPoId(record);
    if (!poId) {
      return;
    }

    const base = this.form.fieldConfigs.poNumber;
    this.form.fieldConfigs.poNumber = {
      ...base,
      selectConfig: {
        ...base.selectConfig,
        optionsDropdown: [
          {
            label: resolveAdvancePaymentPoNumber(record) ?? poId,
            value: poId,
          },
        ],
      },
    } as IInputFieldsConfig;
  }

  private loadPoOptions(siteId: string): void {
    this.applyPoOptions(
      this.form.fieldConfigs.poNumber.selectConfig?.optionsDropdown ?? [],
      true
    );

    const paramData: IPoDropdownGetRequestDto = {
      projectName: siteId,
      docType: this.docContext(),
    };

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
          this.applyPoOptions(
            this.form.fieldConfigs.poNumber.selectConfig?.optionsDropdown ?? [],
            false
          );
        },
      });
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

  private mapRecordPoMeta(
    record: IAdvancePaymentGetBaseResponseDto
  ): IPoDropdownRecordDto['meta'] | null {
    const po = record.po;
    if (!po && !record.poId) {
      return null;
    }

    return {
      poNumber: resolveAdvancePaymentPoNumber(record) ?? '',
      totalAmount: Number(po?.totalAmount ?? 0),
      invoicedTotal: 0,
      remaining: Number(po?.totalAmount ?? 0),
    };
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
      this.selectedPoMeta.set(
        matched ?? this.mapRecordPoMeta(this.selectedRecord()[0])
      );
      return;
    }

    this.selectedPoMeta.set(null);
  }

  private applyPoOptions(options: IOptionDropdown[], loading: boolean): void {
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
    const advancePaymentId = this.selectedRecord()[0]?.id;
    if (!advancePaymentId) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }

    this.executeEditAdvancePaymentAction(
      advancePaymentId,
      this.prepareFormData()
    );
  }

  private prepareFormData(): IEditAdvancePaymentFormDto {
    const formData = this.form.getData();
    const record = { ...formData };
    delete (record as Record<string, unknown>)['projectName'];
    delete (record as Record<string, unknown>)['poNumber'];
    delete (record as Record<string, unknown>)['advanceAttachment'];
    return record;
  }

  private executeEditAdvancePaymentAction(
    advancePaymentId: string,
    formData: IEditAdvancePaymentFormDto
  ): void {
    this.loadingService.show({
      title: 'Updating advance payment',
      message:
        'Please wait while we update the advance payment. This will just take a moment.',
    });
    this.form.disable();

    this.advancePaymentService
      .editAdvancePayment(formData, advancePaymentId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IEditAdvancePaymentResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to edit advance payment', error);
          this.notificationService.error(
            'Could not update advance payment. Please try again.'
          );
        },
      });
  }
}
